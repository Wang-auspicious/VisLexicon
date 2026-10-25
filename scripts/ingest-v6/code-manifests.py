"""Extract pinned package/TypeScript metadata from already fetched source archives.

No network calls, installs or lifecycle execution. Run during intake or after it.
"""
import importlib.util
import io
import json
from pathlib import Path, PurePosixPath
import re
import zipfile

spec = importlib.util.spec_from_file_location('frontier', Path(__file__).with_name('code-frontier.py'))
frontier = importlib.util.module_from_spec(spec)
spec.loader.exec_module(frontier)
out = frontier.ROOT / 'data/ingest-v6/code'
reports = []
for file in (out / 'source-receipts').glob('*.json'):
    receipt = json.loads(file.read_text(encoding='utf-8'))
    items = receipt.get('items', [])
    fetched = [item for item in items if item.get('status') == 'source-fetched']
    if not fetched:
        continue
    first = fetched[0]
    digest = first['archiveDigest']
    archive_path = out / 'raw' / digest[:2] / digest
    if not archive_path.exists():
        continue
    repo = first['repo']
    commit = first['commit']
    key = repo.lower().replace('/', '--')
    source_root = out / 'sources' / key / commit
    report_file = out / 'manifests' / (key + '.json')
    if report_file.exists():
        previous = json.loads(report_file.read_text(encoding='utf-8'))
        if previous.get('archiveDigest') == digest:
            reports.append(previous)
            continue
    report = {'repo': repo, 'commit': commit, 'archiveDigest': digest,
              'sourceRoot': source_root.relative_to(out).as_posix(), 'packages': [], 'typescriptConfigs': []}
    try:
        with zipfile.ZipFile(archive_path) as archive:
            infos = archive.infolist()
            prefix = infos[0].filename.split('/')[0] + '/'
            names = {info.filename[len(prefix):]: info for info in infos if info.filename.startswith(prefix) and not info.is_dir()}
            licenses = {}
            for path, info in names.items():
                if frontier.safe_path(path) and frontier.LICENSE_NAME.match(PurePosixPath(path).name) and info.file_size <= 1024 * 1024:
                    text = archive.read(info).decode('utf-8', 'replace')
                    licenses[str(PurePosixPath(path).parent)] = {'path': path, 'spdx': frontier.inferred_spdx(text)}
            for path, info in names.items():
                name = PurePosixPath(path).name
                if not frontier.safe_path(path) or info.file_size > 1024 * 1024 or not (name == 'package.json' or re.match(r'^(?:tsconfig|jsconfig)(?:\.[\w-]+)?\.json$', name)):
                    continue
                ancestors = [str(parent) for parent in [PurePosixPath(path).parent, *PurePosixPath(path).parent.parents]]
                license = next((licenses[parent] for parent in ancestors if parent in licenses), None)
                if not license or license['spdx'] not in frontier.PERMISSIVE:
                    continue
                if ((info.external_attr >> 16) & 0o170000) == 0o120000:
                    continue
                raw = archive.read(info)
                target = source_root / path
                target_file = frontier.filesystem_path(target)
                target_file.parent.mkdir(parents=True, exist_ok=True)
                target_file.write_bytes(raw)
                item = {'path': path, 'sourcePath': target.relative_to(out).as_posix(), 'rawDigest': frontier.sha(raw), 'license': license,
                        'sourceUrl': 'https://github.com/' + repo + '/blob/' + commit + '/' + path}
                if name == 'package.json':
                    try:
                        package = json.loads(raw)
                        item.update(name=package.get('name'), version=package.get('version'), licenseDeclared=package.get('license'),
                                    dependencies=package.get('dependencies', {}), peerDependencies=package.get('peerDependencies', {}),
                                    devDependencies=package.get('devDependencies', {}), exports=package.get('exports'), imports=package.get('imports'))
                    except Exception:
                        item['reason'] = 'Package manifest JSON could not be parsed'
                    report['packages'].append(item)
                else:
                    report['typescriptConfigs'].append(item)
        frontier.dump(report_file, report)
        reports.append(report)
    except Exception as error:
        print(repo, type(error).__name__, str(error)[:160], flush=True)
frontier.dump(out / 'manifests.json', reports)
print(json.dumps({'repositories': len(reports), 'packages': sum(len(item['packages']) for item in reports), 'typescriptConfigs': sum(len(item['typescriptConfigs']) for item in reports)}, indent=2))
