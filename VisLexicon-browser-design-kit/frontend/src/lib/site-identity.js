const SUPPORTED_STATUSES = new Set(['published', 'candidate']);
const EXACT_TRACKING_KEYS = new Set([
  'atp',
  'ep',
  'fpr',
  'irclickid',
  'session',
  'u',
]);
const PSEUDO_HOSTNAMES = new Set([
  'git',
  'git+http',
  'git+https',
  'http',
  'https',
]);
const SHARED_CODE_HOSTS = new Set([
  'bitbucket.org',
  'github.com',
  'gitlab.com',
]);
const resolverIndexCache = new WeakMap();

function protocolError() {
  return new TypeError('Identity URL must use HTTP(S).');
}

function malformedError() {
  return new TypeError('Identity URL is malformed.');
}

function publicHostError() {
  return new TypeError('Identity URL host is not publicly verifiable.');
}

function prepareInput(input) {
  const githubShorthand = /^github:(.*)$/iu.exec(input);

  if (githubShorthand) {
    const pieces = githubShorthand[1].split('/');
    const isValidPiece = (piece) =>
      /^[a-z\d_.-]+$/iu.test(piece) && piece !== '.' && piece !== '..';

    if (pieces.length !== 2 || !pieces.every(isValidPiece)) {
      throw malformedError();
    }

    return `https://github.com/${pieces[0]}/${pieces[1]}`;
  }

  if (/^git\+https:\/\//iu.test(input)) {
    return input.replace(/^git\+https:/iu, 'https:');
  }

  if (/^git:\/\//iu.test(input)) {
    return input.replace(/^git:/iu, 'https:');
  }

  if (/^(?:\[[^\]]+\]|[^/?#:\s]+\.[^/?#:\s]+):\d+(?:[/?#]|$)/u.test(input)) {
    return `https://${input}`;
  }

  const explicitScheme = /^([a-z][a-z\d+.-]*):/iu.exec(input);

  if (explicitScheme && !/^https?$/iu.test(explicitScheme[1])) {
    throw protocolError();
  }

  if (input.startsWith('//')) {
    return `https:${input}`;
  }

  return explicitScheme ? input : `https://${input}`;
}

function parseIpv4(hostname) {
  const pieces = hostname.split('.');

  if (
    pieces.length !== 4 ||
    pieces.some((piece) => !/^\d+$/u.test(piece))
  ) {
    return null;
  }

  const octets = pieces.map(Number);
  return octets.every((octet) => octet >= 0 && octet <= 255)
    ? octets
    : null;
}

function isNonPublicIpv4(octets) {
  const [first, second, third] = octets;

  return (
    first === 0 ||
    first === 10 ||
    (first === 100 && second >= 64 && second <= 127) ||
    first === 127 ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 0 && third === 0) ||
    (first === 192 && second === 0 && third === 2) ||
    (first === 192 && second === 88 && third === 99) ||
    (first === 192 && second === 168) ||
    (first === 198 && second >= 18 && second <= 19) ||
    (first === 198 && second === 51 && third === 100) ||
    (first === 203 && second === 0 && third === 113) ||
    first >= 224
  );
}

function parseIpv6(hostname) {
  let source = hostname.replace(/^\[|\]$/gu, '').toLowerCase();

  if (source.includes('.')) {
    const lastColon = source.lastIndexOf(':');
    const ipv4 = parseIpv4(source.slice(lastColon + 1));

    if (!ipv4) {
      return null;
    }

    const high = (ipv4[0] << 8) | ipv4[1];
    const low = (ipv4[2] << 8) | ipv4[3];
    source = `${source.slice(0, lastColon)}:${high.toString(16)}:${low.toString(16)}`;
  }

  const halves = source.split('::');

  if (halves.length > 2) {
    return null;
  }

  const left = halves[0] ? halves[0].split(':') : [];
  const right = halves.length === 2 && halves[1] ? halves[1].split(':') : [];
  const omittedCount = 8 - left.length - right.length;

  if (
    (halves.length === 1 && omittedCount !== 0) ||
    (halves.length === 2 && omittedCount < 1)
  ) {
    return null;
  }

  const expanded = [
    ...left,
    ...Array.from({ length: omittedCount }, () => '0'),
    ...right,
  ];

  if (
    expanded.length !== 8 ||
    expanded.some((piece) => !/^[a-f\d]{1,4}$/u.test(piece))
  ) {
    return null;
  }

  return expanded.map((piece) => Number.parseInt(piece, 16));
}

function isNonPublicIpv6(hextets) {
  const isUnspecified = hextets.every((part) => part === 0);
  const isLoopback = hextets.slice(0, 7).every((part) => part === 0) &&
    hextets[7] === 1;
  const isLinkLocal = (hextets[0] & 0xffc0) === 0xfe80;
  const isSiteLocal = (hextets[0] & 0xffc0) === 0xfec0;
  const isUniqueLocal = (hextets[0] & 0xfe00) === 0xfc00;
  const isMulticast = (hextets[0] & 0xff00) === 0xff00;
  const isDocumentation = hextets[0] === 0x2001 && hextets[1] === 0x0db8;
  const isIpv4Compatible = hextets.slice(0, 6).every((part) => part === 0);
  const isIpv4Mapped = hextets.slice(0, 5).every((part) => part === 0) &&
    hextets[5] === 0xffff;
  const isIpv4Translated = hextets.slice(0, 4).every((part) => part === 0) &&
    hextets[4] === 0xffff &&
    hextets[5] === 0;

  if (isIpv4Compatible || isIpv4Mapped || isIpv4Translated) {
    const ipv4 = [
      hextets[6] >> 8,
      hextets[6] & 0xff,
      hextets[7] >> 8,
      hextets[7] & 0xff,
    ];
    return isNonPublicIpv4(ipv4);
  }

  return (
    isUnspecified ||
    isLoopback ||
    isLinkLocal ||
    isSiteLocal ||
    isUniqueLocal ||
    isMulticast ||
    isDocumentation
  );
}

function ensurePublicHost(hostname) {
  const unwrapped = hostname.replace(/^\[|\]$/gu, '').toLowerCase();
  const ipv4 = parseIpv4(unwrapped);

  if (ipv4) {
    if (isNonPublicIpv4(ipv4)) {
      throw publicHostError();
    }
    return;
  }

  if (unwrapped.includes(':')) {
    const ipv6 = parseIpv6(unwrapped);
    if (!ipv6 || isNonPublicIpv6(ipv6)) {
      throw publicHostError();
    }
    return;
  }

  const labels = unwrapped.split('.');
  const hasValidDnsLabels =
    unwrapped.length <= 253 &&
    labels.every(
      (label) =>
        label.length <= 63 &&
        /^[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?$/u.test(label),
    );
  const firstLabel = labels[0];

  if (
    PSEUDO_HOSTNAMES.has(unwrapped) ||
    firstLabel === 'http' ||
    firstLabel === 'https' ||
    unwrapped === 'localhost' ||
    unwrapped.endsWith('.localhost') ||
    unwrapped.endsWith('.local') ||
    !unwrapped.includes('.') ||
    unwrapped.startsWith('.') ||
    unwrapped.includes('..') ||
    !hasValidDnsLabels
  ) {
    throw publicHostError();
  }
}

function isTrackingKey(key) {
  const lowered = key.toLowerCase();
  return (
    EXACT_TRACKING_KEYS.has(lowered) ||
    lowered.startsWith('utm_') ||
    lowered.startsWith('ir_')
  );
}

function compareQueryEntries([leftKey, leftValue], [rightKey, rightValue]) {
  if (leftKey < rightKey) return -1;
  if (leftKey > rightKey) return 1;
  if (leftValue < rightValue) return -1;
  if (leftValue > rightValue) return 1;
  return 0;
}

function normalizeGithubPath(url) {
  url.pathname = url.pathname.replace(/\.git$/iu, '');
  if (url.hostname !== 'github.com') return;

  const pieces = url.pathname.split('/');
  if (pieces.length < 3 || !pieces[1] || !pieces[2]) return;

  pieces[1] = pieces[1].toLowerCase();
  pieces[2] = pieces[2].toLowerCase();
  url.pathname = pieces.join('/');
}

function weakIdentityKey(normalizedUrl) {
  const url = new URL(normalizedUrl);
  if (url.hostname === 'gitlab.com') {
    return null;
  }
  if (!SHARED_CODE_HOSTS.has(url.hostname)) {
    return url.origin;
  }

  const [, owner, repository] = url.pathname.split('/');
  if (!owner || !repository) {
    return null;
  }

  return `${url.origin}/${owner}/${repository}`;
}

function gitlabRepositoryKey(normalizedUrl) {
  const url = new URL(normalizedUrl);
  if (url.hostname !== 'gitlab.com') return null;

  const pageMarker = url.pathname.indexOf('/-/');
  const repositoryPath = (
    pageMarker === -1 ? url.pathname : url.pathname.slice(0, pageMarker)
  ).replace(/\/+$/u, '');
  const segments = repositoryPath.split('/').filter(Boolean);

  return segments.length >= 2 ? `${url.origin}${repositoryPath}` : null;
}

function findGitlabRepositoryMatches(normalizedUrl, repositories) {
  const url = new URL(normalizedUrl);
  if (url.hostname !== 'gitlab.com') return null;

  const submittedKey = `${url.origin}${url.pathname.replace(/\/+$/u, '')}`;
  let longestMatch = -1;
  let matches = null;

  for (const [repositoryKey, records] of repositories) {
    const isSameRepository =
      submittedKey === repositoryKey ||
      submittedKey.startsWith(`${repositoryKey}/`);
    if (!isSameRepository || repositoryKey.length < longestMatch) continue;

    if (repositoryKey.length > longestMatch) {
      longestMatch = repositoryKey.length;
      matches = new Map();
    }
    for (const [entityId, record] of records) {
      matches.set(entityId, record);
    }
  }

  return matches;
}

/**
 * Produces a deterministic, network-free identity URL.
 * It deliberately does not infer redirect or official-site relationships.
 */
export function normalizeIdentityUrl(input) {
  if (typeof input !== 'string') {
    throw new TypeError('Identity URL must be a string.');
  }

  const trimmed = input.trim();
  if (!trimmed) {
    throw new TypeError('Identity URL must not be empty.');
  }

  let url;
  try {
    url = new URL(prepareInput(trimmed));
  } catch (error) {
    if (error instanceof TypeError && error.message.startsWith('Identity URL')) {
      throw error;
    }
    throw malformedError();
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw protocolError();
  }
  if (url.username || url.password) {
    throw new TypeError('Identity URL must not contain credentials.');
  }

  if (!url.hostname.startsWith('[')) {
    let hostname = url.hostname.replace(/\.+$/gu, '');
    if (hostname.toLowerCase().startsWith('www.')) {
      hostname = hostname.slice(4);
    }
    if (!hostname) {
      throw malformedError();
    }
    url.hostname = hostname;
  }

  ensurePublicHost(url.hostname);

  url.protocol = 'https:';
  if (url.port === '443') {
    url.port = '';
  }
  url.hash = '';

  normalizeGithubPath(url);

  const queryEntries = [...url.searchParams.entries()]
    .filter(([key]) => !isTrackingKey(key))
    .sort(compareQueryEntries);
  url.search = '';
  for (const [key, value] of queryEntries) {
    url.searchParams.append(key, value);
  }

  const pathname = url.pathname === '/' ? '' : url.pathname;
  return `${url.origin}${pathname}${url.search}`;
}

function rowError(index, detail) {
  return new TypeError(`Resolver row at index ${index} ${detail}`);
}

function normalizeRowPrimary(row, index) {
  if (typeof row.primaryUrl !== 'string' || !row.primaryUrl.trim()) {
    throw rowError(index, 'must have a non-empty string primaryUrl.');
  }

  try {
    return normalizeIdentityUrl(row.primaryUrl);
  } catch {
    throw rowError(index, 'has an unverifiable primaryUrl.');
  }
}

function normalizeRowAliases(row, index) {
  if (!Array.isArray(row.aliases)) {
    throw rowError(index, 'aliases must be an array.');
  }

  return Array.from({ length: row.aliases.length }, (_, aliasIndex) => {
    const alias = row.aliases[aliasIndex];
    if (typeof alias !== 'string' || !alias.trim()) {
      throw rowError(
        index,
        `has an unverifiable alias at index ${aliasIndex}.`,
      );
    }

    try {
      return normalizeIdentityUrl(alias);
    } catch {
      throw rowError(
        index,
        `has an unverifiable alias at index ${aliasIndex}.`,
      );
    }
  });
}

function indexResolverRows(rows) {
  if (!Array.isArray(rows)) {
    throw new TypeError('Resolver rows must be an array.');
  }

  const entityIds = new Set();
  const urlOwners = new Map();
  const primaryUrls = new Map();
  const aliasUrls = new Map();
  const origins = new Map();
  const gitlabRepositories = new Map();

  const registerUrl = (normalizedUrl, record, kind) => {
    const owner = urlOwners.get(normalizedUrl);
    if (owner) {
      if (owner.entityId === record.entityId) {
        throw new TypeError(
          `Resolver URL "${normalizedUrl}" is duplicated within entity "${record.entityId}".`,
        );
      }
      throw new TypeError(
        `Resolver URL "${normalizedUrl}" is assigned to multiple entities.`,
      );
    }

    urlOwners.set(normalizedUrl, record);
    (kind === 'primary' ? primaryUrls : aliasUrls).set(normalizedUrl, record);

    const repositoryKey = gitlabRepositoryKey(normalizedUrl);
    if (repositoryKey) {
      let repositoryRecords = gitlabRepositories.get(repositoryKey);
      if (!repositoryRecords) {
        repositoryRecords = new Map();
        gitlabRepositories.set(repositoryKey, repositoryRecords);
      }
      repositoryRecords.set(record.entityId, record);
      return;
    }

    const weakKey = weakIdentityKey(normalizedUrl);
    if (!weakKey) return;

    let originRecords = origins.get(weakKey);
    if (!originRecords) {
      originRecords = new Map();
      origins.set(weakKey, originRecords);
    }
    originRecords.set(record.entityId, record);
  };

  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];
    if (!row || typeof row !== 'object' || Array.isArray(row)) {
      throw rowError(index, 'must be an object.');
    }
    if (typeof row.entityId !== 'string' || !row.entityId.trim()) {
      throw rowError(index, 'must have a non-empty string entityId.');
    }
    if (entityIds.has(row.entityId)) {
      throw new TypeError(`Resolver entityId "${row.entityId}" is duplicated.`);
    }
    if (!SUPPORTED_STATUSES.has(row.status)) {
      throw rowError(
        index,
        'status must be "published" or "candidate".',
      );
    }
    if (
      row.canonicalName !== undefined &&
      (typeof row.canonicalName !== 'string' || !row.canonicalName.trim())
    ) {
      throw rowError(index, 'canonicalName must be a non-empty string when set.');
    }

    entityIds.add(row.entityId);
    const primaryUrl = normalizeRowPrimary(row, index);
    const aliases = normalizeRowAliases(row, index);
    const record = {
      entityId: row.entityId,
      status: row.status,
      primaryUrl,
    };

    registerUrl(primaryUrl, record, 'primary');
    for (const alias of aliases) {
      registerUrl(alias, record, 'alias');
    }
  }

  return { aliasUrls, gitlabRepositories, origins, primaryUrls };
}

function isDeeplyFrozenRowsSnapshot(rows) {
  if (!Array.isArray(rows) || !Object.isFrozen(rows)) return false;

  for (let index = 0; index < rows.length; index += 1) {
    if (!Object.prototype.hasOwnProperty.call(rows, index)) return false;

    const row = rows[index];
    if (!row || typeof row !== 'object' || !Object.isFrozen(row)) return false;
    if (!Array.isArray(row.aliases) || !Object.isFrozen(row.aliases)) {
      return false;
    }
  }

  return true;
}

function getResolverIndex(rows) {
  const cacheable = isDeeplyFrozenRowsSnapshot(rows);
  if (cacheable) {
    const cached = resolverIndexCache.get(rows);
    if (cached) return cached;
  }

  const index = indexResolverRows(rows);
  if (cacheable) {
    resolverIndexCache.set(rows, index);
  }
  return index;
}

function exactResult(kind, normalizedUrl, record) {
  return {
    kind,
    normalizedUrl,
    entityId: record.entityId,
    status: record.status,
    primaryUrl: record.primaryUrl,
  };
}

/**
 * Resolves only evidence present in rows. Same-origin matches remain advisory and
 * never become aliases or automatic merges.
 */
export function resolveSubmittedUrl(input, rows) {
  let normalizedUrl;
  try {
    normalizedUrl = normalizeIdentityUrl(input);
  } catch (error) {
    if (error instanceof TypeError) {
      return { kind: 'unverifiable', reason: error.message };
    }
    throw error;
  }

  const { aliasUrls, gitlabRepositories, origins, primaryUrls } =
    getResolverIndex(rows);
  const primary = primaryUrls.get(normalizedUrl);
  if (primary) {
    return exactResult(primary.status, normalizedUrl, primary);
  }

  const alias = aliasUrls.get(normalizedUrl);
  if (alias) {
    return exactResult('known-alias', normalizedUrl, alias);
  }

  const weakKey = weakIdentityKey(normalizedUrl);
  const sameOrigin =
    findGitlabRepositoryMatches(normalizedUrl, gitlabRepositories) ||
    (weakKey ? origins.get(weakKey) : null);
  if (sameOrigin) {
    return {
      kind: 'suspected-duplicate',
      normalizedUrl,
      matches: [...sameOrigin.values()].map((record) => ({
        entityId: record.entityId,
        status: record.status,
        primaryUrl: record.primaryUrl,
      })),
    };
  }

  return { kind: 'new-link', normalizedUrl };
}
