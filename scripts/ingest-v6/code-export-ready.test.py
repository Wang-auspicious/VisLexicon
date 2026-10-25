import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

spec = importlib.util.spec_from_file_location('ready', Path(__file__).with_name('code-export-ready.py'))
ready = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ready)


class ExportMarkerTests(unittest.TestCase):
    def fixture(self, out):
        summary = {'uniqueRepositories': 1, 'repositoriesAttempted': 1, 'sourceFetched': 1, 'candidateFiles': 1,
                   'countConservation': {'inputs': 1, 'inputDispositions': 1, 'candidates': 1, 'candidateDispositions': 1}}
        repo = {'repo': 'author/library', 'commit': 'abc', 'sourceCandidates': 1, 'frontierStatus': 'enumerated',
                'license': {'policyRevision': 2, 'declaredSpdx': 'MIT', 'verifiedTextSpdx': 'MIT', 'redistributable': True}}
        row = {'id': 'source-1', 'repo': repo['repo'], 'commit': 'abc', 'status': 'source-fetched', 'rawDigest': 'original',
               'sourcePath': 'sources/original.tsx', 'archiveDigest': 'archive', 'license': {'spdx': 'MIT', 'rawDigest': 'license', 'redistributable': True}}
        for name, value in [('summary.json', summary), ('repositories.json', [repo]), ('catalog.json', {'count': 1}), ('input-dispositions.json', {})]:
            ready.frontier.dump(out / name, value)
        ready.frontier.dump(out / 'source-receipts/author--library.json', {'receiptRevision': 4, 'summary': {'sourceFetched': 1, 'sourcesStatus': 'fetched'}, 'items': [row]})
        (out / 'catalog.jsonl').write_text(json.dumps(row) + '\n', encoding='utf-8')
        (out / 'frontier.jsonl').write_text(json.dumps(row) + '\n', encoding='utf-8')
        return summary, row

    def test_marker_binds_actual_receipts_and_catalog(self):
        with tempfile.TemporaryDirectory() as temporary:
            out = Path(temporary)
            self.fixture(out)
            ready.mark_ready(out)
            marker = json.loads((out / 'export-ready.json').read_text())
            self.assertTrue(marker['dispositionDrainComplete'])
            self.assertEqual(marker['sourceFetched'], 1)
            self.assertEqual(marker['receipts'][0]['receiptRevision'], 4)
            self.assertEqual(marker['liveComponents'], 0)

    def test_incomplete_denominator_and_catalog_drift_fail_closed(self):
        with tempfile.TemporaryDirectory() as temporary:
            out = Path(temporary)
            summary, row = self.fixture(out)
            summary['uniqueRepositories'] = 2
            ready.frontier.dump(out / 'summary.json', summary)
            with self.assertRaisesRegex(ValueError, 'denominator'):
                ready.mark_ready(out)
            self.assertFalse((out / 'export-ready.json').exists())
            self.fixture(out)
            row['rawDigest'] = 'changed after approval'
            (out / 'catalog.jsonl').write_text(json.dumps(row) + '\n', encoding='utf-8')
            with self.assertRaisesRegex(ValueError, 'drift'):
                ready.mark_ready(out)
            self.assertFalse((out / 'export-ready.json').exists())


if __name__ == '__main__':
    unittest.main()
