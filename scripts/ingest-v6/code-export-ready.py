"""Issue one final source-export marker only after the complete intake drains.

This never promotes compiled/live status. Publishers must verify the marker's
hashes and the original source bytes at point of export.
"""
import argparse
import hashlib
import importlib.util
import json
from pathlib import Path

spec = importlib.util.spec_from_file_location('frontier', Path(__file__).with_name('code-frontier.py'))
frontier = importlib.util.module_from_spec(spec)
spec.loader.exec_module(frontier)


def file_digest(file):
    result = hashlib.sha256()
    with file.open('rb') as stream:
        while data := stream.read(4 * 1024 * 1024):
            result.update(data)
    return result.hexdigest()


def require(condition, reason):
    if not condition:
        raise ValueError(reason)


def mark_ready(out):
    marker = out / 'export-ready.json'
    marker.unlink(missing_ok=True)
    summary_file = out / 'summary.json'
    repos_file = out / 'repositories.json'
    summary = json.loads(summary_file.read_text(encoding='utf-8'))
    repos = json.loads(repos_file.read_text(encoding='utf-8'))
    require(len(repos) == summary['uniqueRepositories'] == summary['repositoriesAttempted'], 'Full repository denominator not drained')
    require(len({repo['repo'].lower() for repo in repos}) == len(repos), 'Repeated canonical repository')
    require(summary['countConservation']['inputs'] == summary['countConservation']['inputDispositions'], 'Input count mismatch')
    require(summary['countConservation']['candidates'] == summary['countConservation']['candidateDispositions'], 'Candidate count mismatch')
    receipts = []
    approved = {}
    fetched = candidates = pending = references = 0
    for repo in repos:
        key = repo['repo'].lower().replace('/', '--')
        receipt_file = out / 'source-receipts' / (key + '.json')
        if not repo.get('sourceCandidates'):
            status = 'repository-blocked' if repo['frontierStatus'] != 'enumerated' else 'no-source-candidates'
            body = {'receiptRevision': 4, 'summary': {'sourcesStatus': status, 'sourceFetched': 0, 'sourceBlocked': 0, 'reason': repo.get('reason')}, 'items': []}
            frontier.dump(receipt_file, body)
        else:
            body = json.loads(receipt_file.read_text(encoding='utf-8'))
            if body.get('receiptRevision') != 4:
                # Earlier reference-only receipts never contained exportable code;
                # audit their complete dispositions before upgrading the marker.
                require(not repo.get('license', {}).get('redistributable'), 'Source receipt needs current file-level policy audit')
                require(all(item['status'] == 'reference-only' and not item.get('sourcePath') for item in body['items']), 'Old receipt contains unaudited source')
                body['receiptRevision'] = 4
                frontier.dump(receipt_file, body)
        items = body['items']
        require(len(items) == repo.get('sourceCandidates', 0), 'Repository source count mismatch: ' + repo['repo'])
        require(len({item['id'] for item in items}) == len(items), 'Repeated source identity')
        count = 0
        for item in items:
            require(item.get('commit') == repo.get('commit'), 'Source commit drift')
            candidates += 1
            if item['status'] == 'source-fetched':
                root = repo.get('license', {})
                require(root.get('policyRevision') == 2 and root.get('declaredSpdx') in frontier.PERMISSIVE and root.get('verifiedTextSpdx') == root.get('declaredSpdx') and root.get('redistributable'), 'Root license gate drift')
                require(item.get('license', {}).get('redistributable') and item['license']['spdx'] in frontier.PERMISSIVE, 'Per-file license gate drift')
                require(item.get('rawDigest') and item.get('sourcePath') and item.get('archiveDigest'), 'Original-byte evidence missing')
                count += 1
                approved[item['id']] = (item['rawDigest'], item['sourcePath'], item['commit'], item['repo'], item['license']['spdx'], item['license']['rawDigest'])
            elif item['status'] == 'pending-source':
                require(item.get('reason'), 'Pending item lacks an actual failure reason')
                pending += 1
            elif item['status'] == 'reference-only':
                require(item.get('reason'), 'Reference lacks a disposition reason')
                references += 1
            else:
                raise AssertionError('Unexpected source disposition: ' + str(item.get('status')))
        require(count == body['summary']['sourceFetched'], 'Fetched source count mismatch')
        fetched += count
        receipts.append({'repo': repo['repo'], 'commit': repo.get('commit'), 'path': receipt_file.relative_to(out).as_posix(),
                         'digest': file_digest(receipt_file), 'receiptRevision': 4, 'candidates': len(items), 'sourceFetched': count,
                         'sourcesStatus': body['summary']['sourcesStatus']})
    require(fetched == summary['sourceFetched'] and candidates == summary['candidateFiles'], 'Aggregate source receipts drifted')
    seen = set()
    with (out / 'catalog.jsonl').open(encoding='utf-8') as stream:
        for line in stream:
            if not line.strip():
                continue
            item = json.loads(line)
            identity = item['id']
            require(identity in approved and identity not in seen, 'Catalog contains an unapproved/repeated source identity')
            values = (item['rawDigest'], item['sourcePath'], item['commit'], item['repo'], item['license']['spdx'], item['license']['rawDigest'])
            require(values == approved[identity] and item['license']['redistributable'], 'Catalog source or license drift')
            seen.add(identity)
    require(len(seen) == fetched, 'Catalog omits approved source files')
    files = ['summary.json', 'repositories.json', 'catalog.json', 'catalog.jsonl', 'frontier.jsonl', 'input-dispositions.json']
    manifest = {'schemaVersion': 1, 'createdAt': frontier.now(), 'receiptRevision': 4, 'rootLicensePolicyRevision': 2,
                'dispositionDrainComplete': True, 'allSourceFilesAvailable': pending == 0 and references == 0,
                'uniqueRepositories': len(repos), 'candidateFiles': candidates, 'sourceFetched': fetched,
                'referenceOnly': references, 'pendingSource': pending, 'publishedComponents': 0, 'liveComponents': 0,
                'files': [{'path': name, 'digest': file_digest(out / name)} for name in files], 'receipts': receipts,
                'note': 'Source-only export eligibility. No compiled, visual, interactive or published component claims.'}
    frontier.dump(marker, manifest)
    print(json.dumps({k: manifest[k] for k in ('dispositionDrainComplete', 'uniqueRepositories', 'candidateFiles', 'sourceFetched', 'referenceOnly', 'pendingSource', 'publishedComponents', 'liveComponents')}, indent=2))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--out')
    args = parser.parse_args()
    mark_ready(Path(args.out).resolve() if args.out else frontier.ROOT / 'data/ingest-v6/code')
