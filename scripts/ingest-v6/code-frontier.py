"""Resumable, read-only GitHub/npm source intake; never execute upstream code.

An enumerated file is an intake candidate, never a published/live component.
All response bytes are persisted before interpretation. Source bytes remain local.
"""
from __future__ import annotations

import argparse
import base64
import concurrent.futures
import datetime as dt
import hashlib
import io
import json
import os
from pathlib import Path, PurePosixPath
import re
import shutil
import subprocess
import sys
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
import zipfile

ROOT = Path(__file__).resolve().parents[2]
PERMISSIVE = {'MIT', 'Apache-2.0', 'BSD-2-Clause', 'BSD-3-Clause', 'ISC', '0BSD', 'Unlicense', 'CC0-1.0', 'BlueOak-1.0.0'}
PACKAGE_LICENSE_ALIASES = {'Apache-2': 'Apache-2.0', 'Apache 2.0': 'Apache-2.0', 'MIT License': 'MIT', 'BSD-2': 'BSD-2-Clause', 'BSD-3': 'BSD-3-Clause'}
STORY = re.compile(r'\.stories\.(?:[jt]sx?|svelte|vue|mdx)$', re.I)
COMPONENT = re.compile(r'(?:^|/)(?:components?|ui|src/lib)/.+\.(?:tsx|jsx|vue|svelte)$', re.I)
LICENSE_NAME = re.compile(r'^(?:licen[cs]e|copying)(?:[._-][\w.-]+)?$', re.I)
IO_LOCK = threading.Lock()


def now():
    return dt.datetime.now(dt.timezone.utc).isoformat()


def sha(data):
    return hashlib.sha256(data).hexdigest()


def file_sha(file):
    result = hashlib.sha256()
    with file.open('rb') as stream:
        while chunk := stream.read(4 * 1024 * 1024):
            result.update(chunk)
    return result.hexdigest()


def dump(path: Path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(path.name + '.tmp')
    temporary.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    temporary.replace(path)


def append(path: Path, value):
    with IO_LOCK:
        path.parent.mkdir(parents=True, exist_ok=True)
        with path.open('a', encoding='utf-8') as stream:
            stream.write(json.dumps(value, ensure_ascii=False, separators=(',', ':')) + '\n')


def read_lines(path):
    if not path.exists():
        return []
    return [json.loads(line) for line in path.read_text(encoding='utf-8').splitlines() if line.strip()]


def safe_path(value):
    p = PurePosixPath(value)
    return bool(value and not p.is_absolute() and not re.match(r'^[a-zA-Z]:', value) and '\\' not in value
                and all(part not in ('..', '.git', 'node_modules') for part in p.parts))


def filesystem_path(path):
    """Keep logical paths stable while supporting deeply nested Windows sources."""
    path = Path(path).resolve()
    if os.name == 'nt' and not str(path).startswith('\\\\?\\'):
        return Path('\\\\?\\' + str(path))
    return path


def repo_from_url(value):
    if not isinstance(value, str):
        return None
    match = re.search(r'github\.com[:/]([^/\s#]+)/([^/\s#]+)', value)
    if not match:
        return None
    return (match[1] + '/' + re.sub(r'\.git$', '', match[2])).strip('/')


def inferred_spdx(text):
    """Only recognize the actual standard grant; custom text stays unverified."""
    text = re.sub(r'\s+', ' ', text.lower())
    if re.search(r'(?:non[- ]?commercial|not permitted to redistribute|may not redistribute|redistribution is prohibited|no redistribution|additional commercial terms)', text):
        return None
    if 'permission is hereby granted, free of charge' in text and 'to deal in the software without restriction' in text and 'the software is provided' in text:
        return 'MIT'
    if 'apache license' in text and 'version 2.0, january 2004' in text and 'end of terms and conditions' in text:
        return 'Apache-2.0'
    if 'redistribution and use in source and binary forms' in text and 'with or without modification' in text:
        return 'BSD-3-Clause' if re.search(r'neither the names?', text) else 'BSD-2-Clause'
    if 'permission to use, copy, modify, and/or distribute this software for any purpose with or without fee' in text:
        return 'ISC' if 'provided that the above copyright notice' in text else '0BSD'
    if 'this is free and unencumbered software released into the public domain' in text:
        return 'Unlicense'
    if 'blue oak model license' in text and '1.0.0' in text:
        return 'BlueOak-1.0.0'
    if 'cc0 1.0 universal' in text and 'public license fallback' in text and 'limitations and disclaimers' in text:
        return 'CC0-1.0'
    return None


def source_kind(path):
    if re.search(r'(?:^|/)(?:node_modules|vendor|\.git|__tests__|__fixtures__|test-results|coverage)/|\.(?:test|spec|d)\.[cm]?[jt]sx?$', path, re.I):
        return None
    if STORY.search(path):
        return 'story'
    if COMPONENT.search(path) and not re.search(r'\.(test|spec|stories)\.', path, re.I):
        return 'component-source'
    if re.search(r'(?:^|/)(?:src|lib|components?|ui|examples?|demos?)/.+\.(?:[cm]?[jt]sx?|vue|svelte|css|scss|sass|less|json)$', path, re.I):
        return 'support-source'
    return None


def file_license_reason(raw):
    """An explicit restrictive per-file SPDX notice overrides a permissive root."""
    header = raw[:16384].decode('utf-8', 'replace')
    for match in re.finditer(r'SPDX-License-Identifier:\s*([^\r\n]+)', header):
        expression = re.split(r'\*/|-->|[<]', match[1], maxsplit=1)[0].strip()
        identifiers = [token for token in re.split(r'[\s()]+', expression) if token and token not in ('OR', 'AND')]
        if not identifiers or any(token not in PERMISSIVE for token in identifiers):
            return 'Explicit per-file SPDX requires separate review: ' + expression[:100]
    return None


class Intake:
    def __init__(self, args):
        self.args = args
        self.out = Path(args.out).resolve() if args.out else ROOT / 'data/ingest-v6/code'
        self.probe = ROOT / 'data/registry-probe'
        self.out.mkdir(parents=True, exist_ok=True)
        (self.out / 'export-ready.json').unlink(missing_ok=True)
        self.observations = self.out / 'observations.jsonl'
        self.run_id = now().replace(':', '-')
        self.count = 0
        self.archive_cache = {}
        for observation in read_lines(self.observations):
            if observation.get('ok') and observation.get('url', '').startswith('https://codeload.github.com/'):
                self.archive_cache[observation['url']] = observation

    def raw(self, data, provenance):
        digest = sha(data)
        file = self.out / 'raw' / digest[:2] / digest
        file.parent.mkdir(parents=True, exist_ok=True)
        if not file.exists() or file.stat().st_size != len(data) or sha(file.read_bytes()) != digest:
            temporary = file.with_name(file.name + '.' + str(os.getpid()) + '.' + str(threading.get_ident()) + '.tmp')
            temporary.write_bytes(data)
            temporary.replace(file)
        record = {**provenance, 'observedAt': now(), 'digest': digest, 'bytes': len(data), 'rawPath': file.relative_to(self.out).as_posix()}
        append(self.observations, record)
        return record

    def gh(self, endpoint):
        result = subprocess.run(['gh', 'api', endpoint], capture_output=True, timeout=80,
                                creationflags=getattr(subprocess, 'CREATE_NO_WINDOW', 0))
        # stderr may contain sensitive configuration errors, so persist only a short classification.
        if result.returncode:
            message = result.stderr.decode('utf-8', 'replace')
            status = 404 if '404' in message else 403 if '403' in message else 429 if '429' in message else 0
            self.raw(result.stdout, {'transport': 'gh', 'endpoint': endpoint, 'status': status, 'ok': False})
            raise RuntimeError(f'GitHub request failed ({status})')
        evidence = self.raw(result.stdout, {'transport': 'gh', 'endpoint': endpoint, 'status': 200, 'ok': True})
        return json.loads(result.stdout), evidence

    def http(self, url, limit=96 * 1024 * 1024):
        cached = self.archive_cache.get(url)
        if cached:
            file = self.out / cached['rawPath']
            if file.exists() and file.stat().st_size <= limit:
                data = file.read_bytes()
                if sha(data) == cached['digest']:
                    return data, cached
        request = urllib.request.Request(url, headers={'User-Agent': 'VisLexicon-source-intake/6.0', 'Accept': '*/*'})
        with urllib.request.urlopen(request, timeout=65) as response:
            data = response.read(limit + 1)
            if len(data) > limit:
                raise RuntimeError(f'response exceeded {limit} byte intake boundary')
            evidence = self.raw(data, {'transport': 'public-http', 'url': url, 'finalUrl': response.url, 'status': response.status, 'ok': True})
            if url.startswith('https://codeload.github.com/'):
                self.archive_cache[url] = evidence
        return data, evidence

    def archive(self, url):
        """Keep large pinned ZIPs on disk, not in a per-worker memory buffer."""
        cached = self.archive_cache.get(url)
        if cached:
            file = self.out / cached['rawPath']
            if file.exists() and file_sha(file) == cached['digest']:
                return file, cached
        directory = self.out / 'downloads'
        directory.mkdir(parents=True, exist_ok=True)
        temporary = directory / (sha(url.encode()) + '.part')
        request = urllib.request.Request(url, headers={'User-Agent': 'VisLexicon-source-intake/6.0', 'Accept': 'application/zip'})
        size = 0
        digest = hashlib.sha256()
        maximum = getattr(self.args, 'archive_mib', 2048) * 1024 * 1024
        try:
            with urllib.request.urlopen(request, timeout=65) as response, temporary.open('wb') as target:
                while chunk := response.read(4 * 1024 * 1024):
                    size += len(chunk)
                    if size > maximum:
                        raise RuntimeError(f'archive exceeded {maximum} byte configured disk intake boundary')
                    if shutil.disk_usage(self.out).free < 1024 * 1024 * 1024:
                        raise RuntimeError('Less than 1 GiB disk headroom remains; archive preserved for retry')
                    digest.update(chunk)
                    target.write(chunk)
                final_url = response.url
            value = digest.hexdigest()
            file = self.out / 'raw' / value[:2] / value
            file.parent.mkdir(parents=True, exist_ok=True)
            temporary.replace(file)
            evidence = {'transport': 'public-http', 'url': url, 'finalUrl': final_url, 'status': 200, 'ok': True,
                        'storage': 'streamed-archive', 'observedAt': now(), 'digest': value, 'bytes': size, 'rawPath': file.relative_to(self.out).as_posix()}
            append(self.observations, evidence)
            self.archive_cache[url] = evidence
            return file, evidence
        except Exception as error:
            partial_path = None
            partial_digest = None
            partial_size = 0
            if temporary.exists():
                partial_digest = file_sha(temporary)
                partial_size = temporary.stat().st_size
                partial = self.out / 'raw-partial' / partial_digest[:2] / partial_digest
                partial.parent.mkdir(parents=True, exist_ok=True)
                temporary.replace(partial)
                partial_path = partial.relative_to(self.out).as_posix()
            append(self.observations, {'transport': 'public-http', 'url': url, 'ok': False, 'storage': 'partial-archive', 'observedAt': now(),
                                       'bytes': partial_size, 'digest': partial_digest, 'partialPath': partial_path, 'status': getattr(error, 'code', 0),
                                       'reason': type(error).__name__ + ': ' + str(error)[:180]})
            raise

    def npm(self):
        initial = json.loads((self.probe / 'npm.json').read_text(encoding='utf-8'))
        destination = self.out / 'npm'

        def item(pair):
            name, old = pair
            old = old if isinstance(old, dict) else {}
            key = sha(name.encode())[:20]
            cached = destination / (key + '.json')
            if cached.exists() and not self.args.refresh:
                saved = json.loads(cached.read_text(encoding='utf-8'))
                if saved.get('status') != 'blocked':
                    return saved
            result = {'name': name, 'previousVersion': old.get('latest'), 'checkedAt': now()}
            try:
                body, evidence = self.http('https://registry.npmjs.org/' + urllib.parse.quote(name, safe='') + '/latest', 8 * 1024 * 1024)
                data = json.loads(body)
                repository = data.get('repository')
                repository = repository.get('url') if isinstance(repository, dict) else repository
                result.update(version=data.get('version'), licenseDeclared=data.get('license'), repositoryUrl=repository,
                              repo=repo_from_url(repository), evidence=evidence, status='resolved' if repo_from_url(repository) else 'no-github-repository',
                              packageUrl='https://www.npmjs.com/package/' + name, registryUrl='https://registry.npmjs.org/' + urllib.parse.quote(name, safe=''))
            except Exception as error:
                result.update(status='blocked', reason=type(error).__name__ + ': ' + str(error)[:160])
            dump(cached, result)
            return result

        with concurrent.futures.ThreadPoolExecutor(max_workers=self.args.concurrency) as executor:
            results = list(executor.map(item, initial.items()))
        dump(self.out / 'npm.json', results)
        print('npm metadata complete:', len(results), flush=True)
        return results

    def inventory(self, repo):
        key = repo['repo'].lower().replace('/', '--')
        cached = self.out / 'repos' / (key + '.json')
        if cached.exists() and not self.args.refresh:
            saved = json.loads(cached.read_text(encoding='utf-8'))
            if saved.get('frontierStatus') == 'enumerated' and saved.get('completeTree'):
                license = saved.get('license', {})
                actual_license = inferred_spdx(license.get('text', ''))
                policy_changed = license.get('policyRevision') != 2 or license.get('verifiedTextSpdx') != actual_license
                if policy_changed:
                    license['verifiedTextSpdx'] = actual_license
                    license['redistributable'] = bool(license.get('declaredSpdx') in PERMISSIVE and license.get('declaredSpdx') == license.get('verifiedTextSpdx') and license.get('text'))
                    license['policyRevision'] = 2
                if saved.get('frontierRevision') != 2 or policy_changed:
                    tree = json.loads((self.out / saved['treeEvidence']['rawPath']).read_bytes())
                    self.enumerate_candidates(saved, tree)
                    dump(cached, saved)
                return saved
        record = {**repo, 'checkedAt': now(), 'frontierStatus': 'blocked', 'sourcesStatus': 'pending'}
        try:
            commit, evidence = self.gh('repos/' + repo['repo'] + '/commits/' + urllib.parse.quote(repo.get('defaultBranch') or 'HEAD', safe=''))
            record.update(commit=commit['sha'], commitEvidence=evidence)
            tree_sha = commit['commit']['tree']['sha']
            tree, tree_evidence = self.gh('repos/' + repo['repo'] + '/git/trees/' + tree_sha + '?recursive=1')
            # A recursive tree may be truncated. Descend omitted directories explicitly.
            if tree.get('truncated'):
                tree = self.full_tree(repo['repo'], tree_sha)
                tree_evidence = self.raw(json.dumps(tree, ensure_ascii=False).encode(), {'transport': 'derived-gh-trees', 'repo': repo['repo'], 'commit': commit['sha'], 'status': 200, 'ok': True})
            record.update(treeEvidence=tree_evidence, completeTree=not tree.get('truncated', False), treeFiles=len(tree.get('tree', [])))
            try:
                license, license_evidence = self.gh('repos/' + repo['repo'] + '/license?ref=' + commit['sha'])
                content = base64.b64decode(license.get('content', '').replace('\n', ''))
                license_raw = self.raw(content, {'transport': 'github-license', 'repo': repo['repo'], 'commit': commit['sha'], 'path': license.get('path'), 'status': 200, 'ok': True})
                declared = (license.get('license') or {}).get('spdx_id')
                actual = inferred_spdx(content.decode('utf-8', 'replace'))
                spdx = declared
                # A machine-recognized root grant alone does not override nested licenses.
                record['license'] = {'spdx': spdx or 'unknown', 'declaredSpdx': declared, 'verifiedTextSpdx': actual,
                                     'redistributable': bool(content and declared in PERMISSIVE and actual == declared), 'policyRevision': 2,
                                     'path': license.get('path'), 'url': 'https://github.com/' + repo['repo'] + '/blob/' + commit['sha'] + '/' + license.get('path', 'LICENSE'),
                                     'text': content.decode('utf-8', 'replace'), 'rawDigest': license_raw['digest'], 'evidence': license_evidence, 'verifiedAt': now()}
            except Exception as error:
                record['license'] = {'spdx': 'unknown', 'redistributable': False, 'reason': str(error)}
            self.enumerate_candidates(record, tree)
        except Exception as error:
            record.update(reason=type(error).__name__ + ': ' + str(error)[:200], completeTree=False, sourceCandidates=0)
        dump(cached, record)
        with IO_LOCK:
            self.count += 1
            if self.count % 20 == 0:
                print('repository inventory', self.count, flush=True)
        return record

    def enumerate_candidates(self, record, tree):
        candidates = []
        for entry in tree.get('tree', []):
            path = entry.get('path', '')
            kind = source_kind(path)
            if entry.get('type') != 'blob' or not kind:
                continue
            candidates.append({'id': 'gh-' + sha((record['repo'].lower() + '\0' + record['commit'] + '\0' + path).encode())[:24],
                               'repo': record['repo'], 'commit': record['commit'], 'path': path, 'kind': kind,
                               'gitBlob': entry.get('sha'), 'size': entry.get('size'),
                               'sourceUrl': 'https://github.com/' + record['repo'] + '/blob/' + record['commit'] + '/' + urllib.parse.quote(path, safe='/'),
                               'treeDigest': record['treeEvidence']['digest'], 'status': 'pending-source' if record['license']['redistributable'] else 'reference-only',
                               'reason': None if record['license']['redistributable'] else 'No verified permissive upstream root license',
                               'licenseRedistributable': record['license']['redistributable']})
        key = record['repo'].lower().replace('/', '--')
        frontier_file = self.out / 'frontiers' / (key + '.json')
        dump(frontier_file, candidates)
        record.update(frontierStatus='enumerated', frontierRevision=2, sourceCandidates=len(candidates),
                      storyFiles=sum(item['kind'] == 'story' for item in candidates),
                      componentFiles=sum(item['kind'] == 'component-source' for item in candidates),
                      supportFiles=sum(item['kind'] == 'support-source' for item in candidates),
                      frontierPath=frontier_file.relative_to(self.out).as_posix())

    def full_tree(self, repo, root_sha):
        queue = [('', root_sha)]
        result = []
        while queue:
            prefix, tree_sha = queue.pop()
            body, _ = self.gh('repos/' + repo + '/git/trees/' + tree_sha)
            for entry in body.get('tree', []):
                path = prefix + entry['path']
                if entry['type'] == 'tree':
                    queue.append((path + '/', entry['sha']))
                else:
                    result.append({**entry, 'path': path})
        return {'sha': root_sha, 'tree': result, 'truncated': False}

    def sources(self, record):
        if record['frontierStatus'] != 'enumerated' or not record.get('sourceCandidates'):
            return record
        key = record['repo'].lower().replace('/', '--')
        result_file = self.out / 'source-receipts' / (key + '.json')
        if not record.get('license', {}).get('redistributable'):
            frontier = json.loads((self.out / record['frontierPath']).read_text(encoding='utf-8'))
            items = [{**item, 'status': 'reference-only', 'licenseRedistributable': False,
                      'reason': 'No matching upstream SPDX and actual permissive root license; retained as reference'} for item in frontier]
            summary = {'sourcesStatus': 'reference-only', 'sourceFetched': 0, 'sourceBlocked': len(items)}
            dump(result_file, {'receiptRevision': 3, 'summary': summary, 'items': items})
            return {**record, **summary}
        if result_file.exists() and not self.args.refresh:
            saved = json.loads(result_file.read_text(encoding='utf-8'))
            retry_correctable = any('WinError 206' in item.get('reason', '') or any(item.get('reason', '').endswith('requires separate review: ' + alias) for alias in PACKAGE_LICENSE_ALIASES) for item in saved['items'] if item.get('reason'))
            if saved.get('receiptRevision') in (2, 3, 4) and len(saved['items']) == record['sourceCandidates'] and saved['summary'].get('sourcesStatus') in ('fetched', 'partially-fetched') and all(item.get('commit') == record['commit'] for item in saved['items']) and not retry_correctable:
                if saved.get('receiptRevision') != 4:
                    # Audit the immutable pinned archive in memory. Opening tens of
                    # thousands of tiny files on Windows makes an otherwise linear
                    # license audit needlessly slow. The publisher must still match
                    # sourcePath bytes against rawDigest at the point of export.
                    fetched_items = [item for item in saved['items'] if item.get('status') == 'source-fetched']
                    digest = fetched_items[0].get('archiveDigest') if fetched_items else None
                    archive = None
                    archive_prefix = ''
                    if digest:
                        archive_file = self.out / 'raw' / digest[:2] / digest
                        if file_sha(archive_file) != digest:
                            raise RuntimeError('Immutable source archive digest mismatch')
                        archive = zipfile.ZipFile(archive_file)
                        archive_prefix = archive.infolist()[0].filename.split('/')[0] + '/'
                    for item in saved['items']:
                        if item.get('status') != 'source-fetched':
                            continue
                        try:
                            raw = archive.read(archive_prefix + item['path']) if archive else filesystem_path(self.out / item['sourcePath']).read_bytes()
                            reason = file_license_reason(raw)
                            if sha(raw) != item['rawDigest']:
                                reason = 'Pinned archive source bytes do not match the recorded SHA-256'
                            if reason:
                                raise RuntimeError(reason)
                        except Exception as error:
                            item.update(status='reference-only', reason=str(error), licenseRedistributable=False,
                                        privateSourcePath=item.pop('sourcePath', None))
                            item.get('license', {})['redistributable'] = False
                    if archive:
                        archive.close()
                    saved['summary']['sourceFetched'] = sum(item['status'] == 'source-fetched' for item in saved['items'])
                    saved['summary']['sourceBlocked'] = len(saved['items']) - saved['summary']['sourceFetched']
                    saved['summary']['sourcesStatus'] = 'fetched' if not saved['summary']['sourceBlocked'] else 'partially-fetched'
                    saved['receiptRevision'] = 4
                    dump(result_file, saved)
                return {**record, **saved['summary']}
        frontier = json.loads((self.out / record['frontierPath']).read_text(encoding='utf-8'))
        summary = {'sourcesStatus': 'blocked', 'sourceFetched': 0, 'sourceBlocked': 0}
        receipts = []
        try:
            url = 'https://codeload.github.com/' + record['repo'] + '/zip/' + record['commit']
            archive_file, archive_evidence = self.archive(url)
            with zipfile.ZipFile(archive_file) as archive:
                infos = archive.infolist()
                if not infos:
                    raise RuntimeError('Empty upstream archive')
                prefix = infos[0].filename.split('/')[0] + '/'
                names = {info.filename[len(prefix):]: info for info in infos if info.filename.startswith(prefix) and not info.is_dir()}
                nested = {}
                packages = {}
                for path, info in names.items():
                    if not safe_path(path) or info.file_size > 1024 * 1024:
                        continue
                    name = PurePosixPath(path).name
                    if LICENSE_NAME.match(name):
                        raw = archive.read(info)
                        file_license = file_license_reason(raw)
                        if file_license:
                            raise RuntimeError(file_license)
                        text = raw.decode('utf-8', 'replace')
                        ev = self.raw(raw, {'transport': 'github-archive-license', 'repo': record['repo'], 'commit': record['commit'], 'path': path, 'status': 200, 'ok': True})
                        parent = str(PurePosixPath(path).parent)
                        item = {'spdx': inferred_spdx(text), 'path': path, 'digest': ev['digest'], 'text': text}
                        # Multiple local LICENSE files with conflicting grants block that subtree.
                        if parent in nested and nested[parent]['spdx'] != item['spdx']:
                            item['spdx'] = None
                        nested[parent] = item
                    elif name == 'package.json':
                        try:
                            package = json.loads(archive.read(info))
                            if isinstance(package.get('license'), str):
                                packages[str(PurePosixPath(path).parent)] = package['license']
                        except Exception:
                            pass
                for candidate in frontier:
                    receipt = {**candidate, 'observedAt': now(), 'archiveDigest': archive_evidence['digest']}
                    path = candidate['path']
                    try:
                        if not safe_path(path):
                            raise RuntimeError('Unsafe upstream path')
                        ancestors = [str(parent) for parent in [PurePosixPath(path).parent, *PurePosixPath(path).parent.parents]]
                        license = next((nested[parent] for parent in ancestors if parent in nested), None)
                        if not license or license['spdx'] not in PERMISSIVE:
                            raise RuntimeError('Nearest upstream LICENSE is unknown or non-permissive')
                        declared = next((packages[parent] for parent in ancestors if parent in packages), None)
                        alias_matches = PACKAGE_LICENSE_ALIASES.get(declared) == license['spdx']
                        if declared and declared not in PERMISSIVE and not alias_matches:
                            raise RuntimeError('Package license declaration requires separate review: ' + declared[:70])
                        info = names.get(path)
                        if not info:
                            raise RuntimeError('Pinned file absent from archive')
                        if info.file_size > 2 * 1024 * 1024:
                            raise RuntimeError('Source file exceeds 2 MiB intake boundary')
                        if ((info.external_attr >> 16) & 0o170000) == 0o120000:
                            raise RuntimeError('Symlink is not executable source content')
                        raw = archive.read(info)
                        # Compare archive bytes with the pinned Git blob identity from the tree.
                        blob = hashlib.sha1(b'blob ' + str(len(raw)).encode() + b'\0' + raw).hexdigest()
                        if candidate.get('gitBlob') and blob != candidate['gitBlob']:
                            raise RuntimeError('Pinned Git blob hash mismatch')
                        target = self.out / 'sources' / key / record['commit'] / path
                        target_file = filesystem_path(target)
                        target_file.parent.mkdir(parents=True, exist_ok=True)
                        target_file.write_bytes(raw)
                        receipt.update(status='source-fetched', rawDigest=sha(raw), bytes=len(raw), sourcePath=target.relative_to(self.out).as_posix(),
                                       packageLicenseDeclared=declared, packageLicenseDecision='alias-matched-actual-license' if alias_matches else 'standard-or-inherited',
                                       license={'spdx': license['spdx'], 'text': license['text'], 'rawDigest': license['digest'],
                                                'url': 'https://github.com/' + record['repo'] + '/blob/' + record['commit'] + '/' + urllib.parse.quote(license['path'], safe='/'),
                                                'redistributable': True, 'verifiedAt': now()}, reason=None)
                        summary['sourceFetched'] += 1
                    except Exception as error:
                        receipt.update(status='reference-only', reason=str(error), licenseRedistributable=False)
                        summary['sourceBlocked'] += 1
                    receipts.append(receipt)
            summary['sourcesStatus'] = 'fetched' if not summary['sourceBlocked'] else 'partially-fetched'
        except Exception as error:
            summary['reason'] = type(error).__name__ + ': ' + str(error)[:180]
            receipts = [{**item, 'status': 'pending-source', 'reason': summary['reason']} for item in frontier]
        dump(result_file, {'receiptRevision': 4, 'summary': summary, 'items': receipts})
        with IO_LOCK:
            print('sources', record['repo'], summary['sourcesStatus'], summary['sourceFetched'], '/', len(frontier), flush=True)
        return {**record, **summary}

    def run(self):
        npm = self.npm()
        initial = read_lines(self.probe / 'github.jsonl')
        # Every input observation retains a disposition, including npm joins.
        observations = []
        repos = {}
        for position, item in enumerate(initial):
            key = item['repo'].lower()
            observations.append({'lane': 'github', 'position': position, 'repo': item['repo'], 'disposition': 'canonical-repository' if key not in repos else 'duplicate-exact-repository', 'canonicalRepo': key})
            repos.setdefault(key, {'repo': item['repo'], 'defaultBranch': item.get('defaultBranch'), 'entries': item.get('entries', []), 'archived': item.get('archived', False), 'origin': 'github-probe'})
        for position, item in enumerate(npm):
            repo = item.get('repo')
            key = repo.lower() if repo else None
            observations.append({'lane': 'npm', 'position': position, 'package': item['name'], 'repo': repo, 'disposition': 'duplicate-exact-repository' if key in repos else 'canonical-repository' if key else 'reference-only', 'canonicalRepo': key})
            if key:
                repos.setdefault(key, {'repo': repo, 'origin': 'npm-repository', 'packages': []})
                repos[key].setdefault('packages', []).append(item['name'])
        dump(self.out / 'input-dispositions.json', {'rawCount': len(initial) + len(npm), 'dispositionCount': len(observations), 'observations': observations})
        targets = list(repos.values())
        if self.args.repo:
            targets = [repo for repo in targets if repo['repo'].lower() == self.args.repo.lower()]
        # Archive downloads can progress while other repositories are being enumerated.
        # One future per canonical repo prevents concurrent writers to a source receipt.
        result_map = {}
        with concurrent.futures.ThreadPoolExecutor(max_workers=self.args.concurrency) as executor, concurrent.futures.ThreadPoolExecutor(max_workers=self.args.source_concurrency) as source_executor:
            inventory_futures = {executor.submit(self.inventory, target): target for target in targets}
            source_futures = []
            for future in concurrent.futures.as_completed(inventory_futures):
                record = future.result()
                result_map[record['repo'].lower()] = record
                if not self.args.inventory_only:
                    source_futures.append(source_executor.submit(self.sources, record))
            print('inventory finished', len(result_map), 'repos', flush=True)
            for future in concurrent.futures.as_completed(source_futures):
                record = future.result()
                result_map[record['repo'].lower()] = record
        results = [result_map[target['repo'].lower()] for target in targets]
        dump(self.out / 'repositories.json', results)
        frontier_path = self.out / 'frontier.jsonl'
        catalog_path = self.out / 'catalog.jsonl'
        frontier_path.write_text('', encoding='utf-8')
        catalog_path.write_text('', encoding='utf-8')
        statuses = {}
        candidates = fetched = 0
        for repo in results:
            key = repo['repo'].lower().replace('/', '--')
            receipt_file = self.out / 'source-receipts' / (key + '.json')
            if receipt_file.exists():
                items = json.loads(receipt_file.read_text(encoding='utf-8'))['items']
            elif repo.get('frontierPath'):
                items = json.loads((self.out / repo['frontierPath']).read_text(encoding='utf-8'))
            else:
                items = []
            for item in items:
                # License text stays in per-repo evidence to keep the search index small.
                trimmed = {**item}
                if trimmed.get('license'):
                    trimmed['license'] = {k: v for k, v in trimmed['license'].items() if k != 'text'}
                append(frontier_path, trimmed)
                candidates += 1
                statuses[item['status']] = statuses.get(item['status'], 0) + 1
                if item['status'] == 'source-fetched':
                    append(catalog_path, trimmed)
                    fetched += 1
        summary = {'schemaVersion': 1, 'createdAt': now(), 'inputGithubObservations': len(initial), 'inputNpmObservations': len(npm),
                   'uniqueRepositories': len(targets), 'repositoriesAttempted': len(results), 'repositoriesEnumerated': sum(r['frontierStatus'] == 'enumerated' for r in results),
                   'repositoriesBlocked': sum(r['frontierStatus'] != 'enumerated' for r in results),
                   'candidateFiles': candidates, 'sourceFetched': fetched, 'statuses': statuses, 'publishedComponents': 0, 'liveComponents': 0,
                   'countConservation': {'inputs': len(observations), 'inputDispositions': len(observations), 'candidates': candidates, 'candidateDispositions': sum(statuses.values())},
                   'note': 'Source files are intake records. No screenshot, render, responsive-state or API verification has been claimed.'}
        dump(self.out / 'summary.json', summary)
        # Avoid a multi-hundred-MB JSON array: catalog.json points to the stream plus bounded manifest.
        dump(self.out / 'catalog.json', {'schemaVersion': 1, 'itemsJsonl': 'catalog.jsonl', 'count': fetched, 'summary': summary})
        print(json.dumps(summary, ensure_ascii=False, indent=2), flush=True)
        if not self.args.inventory_only and not self.args.repo:
            subprocess.run([sys.executable, str(Path(__file__).with_name('code-export-ready.py')), '--out', str(self.out)], check=True)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--out')
    parser.add_argument('--concurrency', type=int, default=6)
    parser.add_argument('--source-concurrency', type=int, default=3)
    parser.add_argument('--archive-mib', type=int, default=2048)
    parser.add_argument('--inventory-only', action='store_true')
    parser.add_argument('--refresh', action='store_true')
    parser.add_argument('--repo')
    args = parser.parse_args()
    if not 1 <= args.concurrency <= 12 or not 1 <= args.source_concurrency <= 6:
        parser.error('Concurrency must be within documented API/archive bounds')
    if not 1 <= args.archive_mib <= 16384:
        parser.error('Archive disk boundary must be between 1 MiB and 16 GiB')
    Intake(args).run()
