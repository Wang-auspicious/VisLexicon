"""Read original, already approved workspace bytes from one pinned archive.

This avoids reopening thousands of NTFS files for every preview preparation.
No network requests, installs, or upstream code execution.
"""
import hashlib
import json
from pathlib import Path
import sys
import zipfile

sys.stdout.reconfigure(encoding='utf-8')
receipt_file = Path(sys.argv[1]).resolve()
out = receipt_file.parent.parent
body = receipt_file.read_bytes()
receipt = json.loads(body)
rows = [row for row in receipt.get('items', []) if row.get('status') == 'source-fetched' and row.get('license', {}).get('redistributable')]
archives = {}
result = {'receiptDigest': hashlib.sha256(body).hexdigest(), 'workspaceFiles': [], 'integrityBlocked': []}
for row in rows:
    try:
        digest = row['archiveDigest']
        if digest not in archives:
            archive_file = out / 'raw' / digest[:2] / digest
            check = hashlib.sha256()
            with archive_file.open('rb') as stream:
                while chunk := stream.read(4 * 1024 * 1024):
                    check.update(chunk)
            if check.hexdigest() != digest:
                raise ValueError('Original source archive digest mismatch')
            archive = zipfile.ZipFile(archive_file)
            prefix = archive.infolist()[0].filename.split('/')[0] + '/'
            archives[digest] = (archive, prefix)
        archive, prefix = archives[digest]
        raw = archive.read(prefix + row['path'])
        if hashlib.sha256(raw).hexdigest() != row['rawDigest']:
            raise ValueError('Original archive member differs from recorded source SHA-256')
        if b'\0' in raw:
            raise ValueError('Binary source is not a text compile input')
        content = raw.decode('utf-8')
        result['workspaceFiles'].append({'path': row['path'], 'content': content, 'rawDigest': row['rawDigest'], 'licenseDigest': row['license']['rawDigest']})
    except Exception as error:
        result['integrityBlocked'].append({'parentSourceId': row['id'], 'path': row['path'], 'disposition': 'source-integrity-blocked', 'reason': str(error)})
for archive, _ in archives.values():
    archive.close()
json.dump(result, sys.stdout, ensure_ascii=False, separators=(',', ':'))
