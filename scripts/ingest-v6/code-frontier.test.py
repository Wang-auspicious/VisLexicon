"""Offline regression coverage for cross-license source leakage and pinned bytes."""
import argparse
import base64
import hashlib
import importlib.util
import io
import json
from pathlib import Path
import tempfile
import unittest
import zipfile

spec = importlib.util.spec_from_file_location('frontier', Path(__file__).with_name('code-frontier.py'))
frontier = importlib.util.module_from_spec(spec)
spec.loader.exec_module(frontier)
MIT = 'Permission is hereby granted, free of charge, to deal in the Software without restriction. THE SOFTWARE IS PROVIDED AS IS.'


class IntakeEvidenceTests(unittest.TestCase):
    def test_deep_windows_sources_preserve_logical_path(self):
        with tempfile.TemporaryDirectory() as temporary:
            logical = Path(temporary) / ('nested-' * 12) / ('source-' * 12) / ('component-' * 8) / 'button.tsx'
            actual = frontier.filesystem_path(logical)
            actual.parent.mkdir(parents=True, exist_ok=True)
            actual.write_bytes(b'export const Button = () => null;')
            self.assertEqual(actual.read_bytes(), b'export const Button = () => null;')
            self.assertEqual(logical.relative_to(temporary).as_posix().split('/')[-1], 'button.tsx')
            # tempfile's ordinary-path cleanup cannot traverse >260-char children
            # on hosts without the system-wide long-path policy enabled.
            actual.unlink()
            boundary = frontier.filesystem_path(temporary)
            parent = actual.parent
            while parent != boundary and parent.is_relative_to(boundary):
                parent.rmdir()
                parent = parent.parent

    def test_unknown_upstream_spdx_is_not_promoted_by_mit_text(self):
        with tempfile.TemporaryDirectory() as temporary:
            intake = frontier.Intake(argparse.Namespace(out=temporary, refresh=False))
            commit = '1' * 40
            def gh(endpoint):
                if '/commits/' in endpoint:
                    body = {'sha': commit, 'commit': {'tree': {'sha': '2' * 40}}}
                elif '/git/trees/' in endpoint:
                    body = {'tree': [{'type': 'blob', 'path': 'src/components/button.tsx', 'sha': '3' * 40}], 'truncated': False}
                else:
                    body = {'content': base64.b64encode(MIT.encode()).decode(), 'path': 'LICENSE', 'license': {'spdx_id': 'NOASSERTION'}}
                evidence = intake.raw(json.dumps(body).encode(), {'endpoint': endpoint, 'status': 200})
                return body, evidence
            intake.gh = gh
            record = intake.inventory({'repo': 'author/custom-license'})
            self.assertFalse(record['license']['redistributable'])
            self.assertEqual(record['license']['spdx'], 'NOASSERTION')
            intake.http = lambda _: self.fail('Unknown license must not trigger source archive download')
            result = intake.sources(record)
            self.assertEqual(result['sourcesStatus'], 'reference-only')
            self.assertEqual(result['sourceFetched'], 0)

    def test_untrusted_source_paths_and_urls(self):
        for value in ('../secret.tsx', '/etc/passwd', 'C:/secret', 'src/../../secret', 'src\\secret', '.git/config', 'node_modules/pkg/x'):
            self.assertFalse(frontier.safe_path(value), value)
        self.assertTrue(frontier.safe_path('packages/ui/src/components/button.tsx'))
        self.assertEqual(frontier.repo_from_url('git+https://github.com/owner/repo.git'), 'owner/repo')
        self.assertIsNone(frontier.repo_from_url('https://github.example/owner/repo'))

    def test_custom_restriction_does_not_reuse_mit_grant(self):
        self.assertEqual(frontier.inferred_spdx(MIT), 'MIT')
        self.assertIsNone(frontier.inferred_spdx(MIT + ' You may not redistribute these components.'))
        self.assertIsNone(frontier.inferred_spdx('SPDX: MIT, but no license text provided'))
        self.assertIsNone(frontier.file_license_reason(b'// SPDX-License-Identifier: MIT\nexport const X=1'))
        self.assertIsNone(frontier.file_license_reason(b'/* SPDX-License-Identifier: (MIT OR Apache-2.0) */\n'))
        self.assertIn('separate review', frontier.file_license_reason(b'// SPDX-License-Identifier: GPL-3.0-only\n'))

    def test_nested_license_package_restriction_and_blob_hash_are_enforced(self):
        with tempfile.TemporaryDirectory() as temporary:
            args = argparse.Namespace(out=temporary, refresh=False)
            intake = frontier.Intake(args)
            commit = '1' * 40
            record = {'repo': 'author/library', 'commit': commit, 'frontierStatus': 'enumerated',
                      'sourceCandidates': 4, 'frontierPath': 'frontiers/author--library.json',
                      'license': {'redistributable': True}}
            files = {'LICENSE': MIT.encode(), 'src/components/button.tsx': b'export const Button=()=>null;',
                     'pro/LICENSE': b'All rights reserved. Do not redistribute.',
                     'pro/components/button.tsx': b'export const ProButton=()=>null;',
                     'paid/package.json': b'{"license":"UNLICENSED"}',
                     'paid/components/button.tsx': b'export const PaidButton=()=>null;',
                     'src/components/mismatch.tsx': b'export const Mismatch=()=>null;'}
            entries = []
            for position, path in enumerate(('src/components/button.tsx', 'pro/components/button.tsx', 'paid/components/button.tsx', 'src/components/mismatch.tsx')):
                raw = files[path]
                blob = hashlib.sha1(b'blob ' + str(len(raw)).encode() + b'\0' + raw).hexdigest()
                entries.append({'id': str(position), 'path': path, 'gitBlob': blob if position != 3 else '0' * 40, 'status': 'pending-source'})
            frontier.dump(Path(temporary) / record['frontierPath'], entries)
            buffer = io.BytesIO()
            with zipfile.ZipFile(buffer, 'w') as archive:
                for path, content in files.items():
                    archive.writestr('library-' + commit + '/' + path, content)
            intake.archive = lambda url: (io.BytesIO(buffer.getvalue()), {'digest': frontier.sha(buffer.getvalue())})
            result = intake.sources(record)
            self.assertEqual(result['sourceFetched'], 1)
            self.assertEqual(result['sourceBlocked'], 3)
            receipts = json.loads((Path(temporary) / 'source-receipts/author--library.json').read_text())['items']
            self.assertEqual(len(receipts), len(entries))
            saved = list((Path(temporary) / 'sources').rglob('*.tsx'))
            self.assertEqual(len(saved), 1)
            self.assertEqual(saved[0].read_bytes(), files['src/components/button.tsx'])
            self.assertTrue(all(item['status'] == 'reference-only' for item in receipts[1:]))
            self.assertIn('blob hash mismatch', receipts[-1]['reason'])


if __name__ == '__main__':
    unittest.main()
