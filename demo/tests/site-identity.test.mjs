import assert from 'node:assert/strict';
import test from 'node:test';

import {
  normalizeIdentityUrl,
  resolveSubmittedUrl,
} from '../src/lib/site-identity.js';

test('removes the Designmodo u tracker without collapsing distinct products', () => {
  assert.equal(
    normalizeIdentityUrl('https://designmodo.com/postcards?u=toools'),
    'https://designmodo.com/postcards',
  );
  assert.equal(
    normalizeIdentityUrl('https://designmodo.com/startup?u=toools'),
    'https://designmodo.com/startup',
  );
});

test('removes Semrush ir_* trackers', () => {
  assert.equal(
    normalizeIdentityUrl(
      'https://semrush.com/?ir_adid=995972&ir_campaignid=13053&ir_partnerid=3704448',
    ),
    'https://semrush.com',
  );
});

test('normalizes supported GitHub transport and shorthand URLs', () => {
  const cases = [
    [
      'git+https://github.com/Kiho/react-form-builder.git',
      'https://github.com/kiho/react-form-builder',
    ],
    [
      'github:Azure/azure-sdk-for-js',
      'https://github.com/azure/azure-sdk-for-js',
    ],
    [
      'git://github.com/Ajusa/lit.git',
      'https://github.com/ajusa/lit',
    ],
  ];

  for (const [input, expected] of cases) {
    assert.equal(normalizeIdentityUrl(input), expected);
  }
});

test('normalizes Git transport through www.github.com', () => {
  assert.equal(
    normalizeIdentityUrl('git+https://www.github.com/Facebook/React.git'),
    'https://github.com/facebook/react',
  );
});

test('normalizes GitLab transports while preserving path case', () => {
  assert.equal(
    normalizeIdentityUrl('git+https://gitlab.com/Group/Project.git'),
    'https://gitlab.com/Group/Project',
  );
  assert.equal(
    normalizeIdentityUrl('git://gitlab.com/Group/Project.git'),
    'https://gitlab.com/Group/Project',
  );
});

test('removes a repository suffix for non-GitHub HTTP URLs', () => {
  assert.equal(
    normalizeIdentityUrl('https://code.example/Owner/Project.git'),
    'https://code.example/Owner/Project',
  );
});

test('normalizes scheme, www, host case, fragment, root slash, and default ports', () => {
  assert.equal(
    normalizeIdentityUrl('  HTTP://WWW.Example.COM:80/#section  '),
    'https://example.com',
  );
  assert.equal(
    normalizeIdentityUrl('https://www.Example.COM:443/#section'),
    'https://example.com',
  );
  assert.equal(
    normalizeIdentityUrl('example.com/docs'),
    'https://example.com/docs',
  );
});

test('parses a scheme-less hostname and numeric port as an HTTPS URL', () => {
  assert.equal(
    normalizeIdentityUrl('example.com:443/docs'),
    'https://example.com/docs',
  );
  assert.equal(
    normalizeIdentityUrl('example.com:8443/docs'),
    'https://example.com:8443/docs',
  );
});

test('removes every documented tracking key case-insensitively', () => {
  assert.equal(
    normalizeIdentityUrl(
      'https://example.com/product?utm_source=a&UTM_Campaign=b&fpr=c&atp=d&u=e&ep=f&ir_adid=g&IR_campaignid=h&session=i&irclickid=j&keep=1',
    ),
    'https://example.com/product?keep=1',
  );
});

test('retains meaningful query parameters and sorts them deterministically', () => {
  assert.equal(
    normalizeIdentityUrl(
      'https://example.com/search?z=last&lang=zh-CN&feature=dark',
    ),
    'https://example.com/search?feature=dark&lang=zh-CN&z=last',
  );
});

test('uses the standard URL parser for dot segments and IDNA hostnames', () => {
  assert.equal(
    normalizeIdentityUrl(
      'https://WWW.B\u00dcCHER.example:443/a/./b/../c?q=1#ignored',
    ),
    'https://xn--bcher-kva.example/a/c?q=1',
  );
});

test('rejects empty, non-string, and malformed inputs with stable errors', () => {
  assert.throws(() => normalizeIdentityUrl('   '), {
    name: 'TypeError',
    message: 'Identity URL must not be empty.',
  });
  assert.throws(() => normalizeIdentityUrl(null), {
    name: 'TypeError',
    message: 'Identity URL must be a string.',
  });
  assert.throws(() => normalizeIdentityUrl('not a url'), {
    name: 'TypeError',
    message: 'Identity URL is malformed.',
  });
});

test('rejects credentials and unsupported protocols', () => {
  assert.throws(() => normalizeIdentityUrl('https://user:secret@example.com'), {
    name: 'TypeError',
    message: 'Identity URL must not contain credentials.',
  });

  for (const input of [
    'ftp://example.com/resource',
    'mailto:hello@example.com',
    'data:text/plain,hello',
  ]) {
    assert.throws(() => normalizeIdentityUrl(input), {
      name: 'TypeError',
      message: 'Identity URL must use HTTP(S).',
    });
  }
});

test('rejects local names and private or link-local IPv4 hosts', () => {
  const privateInputs = [
    'https://localhost',
    'https://app.localhost',
    'https://printer.local',
    'https://127.0.0.1',
    'https://127.255.1.2',
    'https://10.23.4.5',
    'https://172.16.0.1',
    'https://172.31.255.254',
    'https://192.168.10.20',
    'https://169.254.20.30',
  ];

  for (const input of privateInputs) {
    assert.throws(() => normalizeIdentityUrl(input), {
      name: 'TypeError',
      message: 'Identity URL host is not publicly verifiable.',
    });
  }
});

test('rejects reserved literal IPv4 prefixes without a network lookup', () => {
  const reservedInputs = [
    'https://100.64.0.1',
    'https://100.127.255.254',
    'https://192.0.0.1',
    'https://198.18.0.1',
    'https://198.19.255.254',
  ];

  for (const input of reservedInputs) {
    assert.throws(() => normalizeIdentityUrl(input), {
      name: 'TypeError',
      message: 'Identity URL host is not publicly verifiable.',
    });
  }
});

test('rejects loopback, link-local, and unique-local IPv6 hosts', () => {
  const privateInputs = [
    'https://[::1]',
    'https://[fe80::1]',
    'https://[febf::1]',
    'https://[fc00::1]',
    'https://[fdff::1]',
  ];

  for (const input of privateInputs) {
    assert.throws(() => normalizeIdentityUrl(input), {
      name: 'TypeError',
      message: 'Identity URL host is not publicly verifiable.',
    });
  }

  assert.equal(
    normalizeIdentityUrl('https://[2001:4860:4860::8888]/'),
    'https://[2001:4860:4860::8888]',
  );
});

test('rejects compatible, translated, site-local, and multicast IPv6 literals', () => {
  const reservedInputs = [
    'https://[::7f00:1]',
    'https://[::ffff:0:7f00:1]',
    'https://[fec0::1]',
    'https://[ff02::1]',
  ];

  for (const input of reservedInputs) {
    assert.throws(() => normalizeIdentityUrl(input), {
      name: 'TypeError',
      message: 'Identity URL host is not publicly verifiable.',
    });
  }
});

test('rejects legacy and Unicode-dot spellings of loopback IPv4 literals', () => {
  const loopbackInputs = [
    'https://127.1',
    'https://2130706433',
    'https://0177.0.0.1',
    'https://0x7f000001',
    'https://127。0．0｡1',
    'https://[::ffff:127.0.0.1]',
  ];

  for (const input of loopbackInputs) {
    assert.throws(() => normalizeIdentityUrl(input), {
      name: 'TypeError',
      message: 'Identity URL host is not publicly verifiable.',
    });
  }
});

test('rejects ambiguous authority credentials before considering their host', () => {
  for (const input of [
    'https://public.example@127.0.0.1',
    'https://127.0.0.1@public.example',
  ]) {
    assert.throws(() => normalizeIdentityUrl(input), {
      name: 'TypeError',
      message: 'Identity URL must not contain credentials.',
    });
  }
});

test('accepts public IPv4 and IPv6 literals', () => {
  assert.equal(normalizeIdentityUrl('https://8.8.8.8/'), 'https://8.8.8.8');
  assert.equal(
    normalizeIdentityUrl('https://[2606:4700:4700::1111]/'),
    'https://[2606:4700:4700::1111]',
  );
});

test('rejects pseudo hostnames that resemble incomplete schemes', () => {
  for (const input of ['http', 'git+https']) {
    assert.throws(() => normalizeIdentityUrl(input), {
      name: 'TypeError',
      message: 'Identity URL host is not publicly verifiable.',
    });
  }
});

test('rejects invalid DNS labels and dotted pseudo hostnames', () => {
  const invalidHosts = [
    'https://-bad.example',
    'https://bad-.example',
    'https://bad_label.example',
    'https://http.example',
    'https://https.example',
    'https://git+https.example',
    'https://git+ssh.example',
  ];

  for (const input of invalidHosts) {
    assert.throws(() => normalizeIdentityUrl(input), {
      name: 'TypeError',
      message: 'Identity URL host is not publicly verifiable.',
    });
  }
});

const aliasRows = [
  {
    entityId: 'headless-ui',
    status: 'published',
    primaryUrl: 'https://headlessui.com',
    aliases: ['https://headlessui.dev'],
    canonicalName: 'Headless UI',
  },
  {
    entityId: 'lucide',
    status: 'candidate',
    primaryUrl: 'https://lucide.dev',
    aliases: ['https://lucide.netlify.app'],
    canonicalName: 'Lucide',
  },
  {
    entityId: 'bits-ui',
    status: 'published',
    primaryUrl: 'https://bits-ui.com',
    aliases: ['https://github.com/huntabyte/bits-ui'],
    canonicalName: 'Bits UI',
  },
  {
    entityId: 'chakra-ui',
    status: 'candidate',
    primaryUrl: 'https://chakra-ui.com',
    aliases: ['https://github.com/chakra-ui/chakra-ui'],
    canonicalName: 'Chakra UI',
  },
];

test('maps published and candidate primary URLs to their status kind', () => {
  assert.deepEqual(resolveSubmittedUrl('https://www.headlessui.com/', aliasRows), {
    kind: 'published',
    normalizedUrl: 'https://headlessui.com',
    entityId: 'headless-ui',
    status: 'published',
    primaryUrl: 'https://headlessui.com',
  });
  assert.deepEqual(resolveSubmittedUrl('https://lucide.dev/', aliasRows), {
    kind: 'candidate',
    normalizedUrl: 'https://lucide.dev',
    entityId: 'lucide',
    status: 'candidate',
    primaryUrl: 'https://lucide.dev',
  });
});

test('recognizes Headless UI and Lucide historical-domain aliases', () => {
  assert.deepEqual(resolveSubmittedUrl('https://headlessui.dev/', aliasRows), {
    kind: 'known-alias',
    normalizedUrl: 'https://headlessui.dev',
    entityId: 'headless-ui',
    status: 'published',
    primaryUrl: 'https://headlessui.com',
  });
  assert.deepEqual(
    resolveSubmittedUrl('https://lucide.netlify.app/', aliasRows),
    {
      kind: 'known-alias',
      normalizedUrl: 'https://lucide.netlify.app',
      entityId: 'lucide',
      status: 'candidate',
      primaryUrl: 'https://lucide.dev',
    },
  );
});

test('recognizes Bits UI and Chakra official and repository URLs without network requests', () => {
  assert.equal(
    resolveSubmittedUrl('https://www.bits-ui.com/', aliasRows).entityId,
    'bits-ui',
  );
  assert.equal(
    resolveSubmittedUrl('https://www.chakra-ui.com/', aliasRows).entityId,
    'chakra-ui',
  );
  assert.deepEqual(
    resolveSubmittedUrl(
      'git+https://github.com/HUNTABYTE/BITS-UI.git',
      aliasRows,
    ),
    {
      kind: 'known-alias',
      normalizedUrl: 'https://github.com/huntabyte/bits-ui',
      entityId: 'bits-ui',
      status: 'published',
      primaryUrl: 'https://bits-ui.com',
    },
  );
  assert.deepEqual(
    resolveSubmittedUrl('github:chakra-ui/chakra-ui', aliasRows),
    {
      kind: 'known-alias',
      normalizedUrl: 'https://github.com/chakra-ui/chakra-ui',
      entityId: 'chakra-ui',
      status: 'candidate',
      primaryUrl: 'https://chakra-ui.com',
    },
  );
});

test('does not merge same-named products that live on different origins', () => {
  const rows = [
    {
      entityId: 'pika-style',
      status: 'published',
      primaryUrl: 'https://pika.style',
      aliases: [],
      canonicalName: 'Pika',
    },
    {
      entityId: 'pika-art',
      status: 'candidate',
      primaryUrl: 'https://pika.art',
      aliases: [],
      canonicalName: 'Pika',
    },
    {
      entityId: 'skeleton-css',
      status: 'published',
      primaryUrl: 'https://getskeleton.com',
      aliases: [],
      canonicalName: 'Skeleton',
    },
    {
      entityId: 'skeleton-ui',
      status: 'candidate',
      primaryUrl: 'https://skeleton.dev',
      aliases: [],
      canonicalName: 'Skeleton',
    },
    {
      entityId: 'stitches-css',
      status: 'published',
      primaryUrl: 'https://stitches.dev',
      aliases: [],
      canonicalName: 'Stitches',
    },
    {
      entityId: 'stitches-template',
      status: 'candidate',
      primaryUrl: 'https://stitches.hyperyolo.com',
      aliases: [],
      canonicalName: 'Stitches',
    },
    {
      entityId: 'adobe-spectrum',
      status: 'published',
      primaryUrl: 'https://spectrum.adobe.com',
      aliases: [],
      canonicalName: 'Spectrum',
    },
    {
      entityId: 'color-spectrum',
      status: 'candidate',
      primaryUrl: 'https://colorspectrum.design',
      aliases: [],
      canonicalName: 'Spectrum',
    },
  ];

  const expectedEntities = new Map([
    ['https://pika.style', 'pika-style'],
    ['https://pika.art', 'pika-art'],
    ['https://getskeleton.com', 'skeleton-css'],
    ['https://skeleton.dev', 'skeleton-ui'],
    ['https://stitches.dev', 'stitches-css'],
    ['https://stitches.hyperyolo.com', 'stitches-template'],
    ['https://spectrum.adobe.com', 'adobe-spectrum'],
    ['https://colorspectrum.design', 'color-spectrum'],
  ]);

  for (const [url, entityId] of expectedEntities) {
    assert.equal(resolveSubmittedUrl(url, rows).entityId, entityId);
  }
});

test('only flags same-origin Adobe product paths as suspected duplicates', () => {
  const rows = [
    {
      entityId: 'react-spectrum',
      status: 'published',
      primaryUrl: 'https://react-spectrum.adobe.com/react-spectrum',
      aliases: [],
      canonicalName: 'React Spectrum',
    },
  ];

  assert.deepEqual(
    resolveSubmittedUrl('https://react-spectrum.adobe.com/react-aria', rows),
    {
      kind: 'suspected-duplicate',
      normalizedUrl: 'https://react-spectrum.adobe.com/react-aria',
      matches: [
        {
          entityId: 'react-spectrum',
          status: 'published',
          primaryUrl: 'https://react-spectrum.adobe.com/react-spectrum',
        },
      ],
    },
  );
});

test('only flags Mobbin alternate entry paths as suspected duplicates', () => {
  const rows = [
    {
      entityId: 'mobbin-mobile',
      status: 'candidate',
      primaryUrl: 'https://mobbin.com/explore/mobile',
      aliases: [],
      canonicalName: 'Mobbin',
    },
  ];

  assert.equal(
    resolveSubmittedUrl('https://mobbin.com/explore/web', rows).kind,
    'suspected-duplicate',
  );
  assert.equal(
    resolveSubmittedUrl('https://mobbin.com/explore/sites', rows).kind,
    'suspected-duplicate',
  );
});

test('does not suspect unrelated GitHub repositories on the shared origin', () => {
  assert.deepEqual(
    resolveSubmittedUrl('https://github.com/facebook/react', aliasRows),
    {
      kind: 'new-link',
      normalizedUrl: 'https://github.com/facebook/react',
    },
  );
});

test('only suspects pages within the same GitHub owner and repository', () => {
  assert.deepEqual(
    resolveSubmittedUrl(
      'https://github.com/HUNTABYTE/BITS-UI/issues',
      aliasRows,
    ),
    {
      kind: 'suspected-duplicate',
      normalizedUrl: 'https://github.com/huntabyte/bits-ui/issues',
      matches: [
        {
          entityId: 'bits-ui',
          status: 'published',
          primaryUrl: 'https://bits-ui.com',
        },
      ],
    },
  );
});

test('does not suspect unrelated GitLab or Bitbucket repositories', () => {
  const rows = [
    {
      entityId: 'gitlab-tool',
      status: 'published',
      primaryUrl: 'https://gitlab-tool.example',
      aliases: ['https://gitlab.com/acme/tool'],
    },
    {
      entityId: 'bitbucket-tool',
      status: 'candidate',
      primaryUrl: 'https://bitbucket-tool.example',
      aliases: ['https://bitbucket.org/acme/tool'],
    },
  ];

  assert.equal(
    resolveSubmittedUrl('https://gitlab.com/other/project', rows).kind,
    'new-link',
  );
  assert.equal(
    resolveSubmittedUrl('https://bitbucket.org/other/project', rows).kind,
    'new-link',
  );
  assert.equal(
    resolveSubmittedUrl('https://gitlab.com/acme/tool/issues', rows).kind,
    'suspected-duplicate',
  );
  assert.equal(
    resolveSubmittedUrl('https://bitbucket.org/acme/tool/issues', rows).kind,
    'suspected-duplicate',
  );
});

test('uses the complete GitLab namespace and project path as repository identity', () => {
  const rows = [
    {
      entityId: 'nested-gitlab-project',
      status: 'candidate',
      primaryUrl: 'https://nested-project.example',
      aliases: ['https://gitlab.com/group/subgroup/project-a'],
    },
  ];

  assert.deepEqual(
    resolveSubmittedUrl(
      'https://gitlab.com/group/subgroup/project-a/-/issues/1',
      rows,
    ),
    {
      kind: 'suspected-duplicate',
      normalizedUrl:
        'https://gitlab.com/group/subgroup/project-a/-/issues/1',
      matches: [
        {
          entityId: 'nested-gitlab-project',
          status: 'candidate',
          primaryUrl: 'https://nested-project.example',
        },
      ],
    },
  );
  assert.deepEqual(
    resolveSubmittedUrl(
      'https://gitlab.com/group/subgroup/project-b',
      rows,
    ),
    {
      kind: 'new-link',
      normalizedUrl: 'https://gitlab.com/group/subgroup/project-b',
    },
  );
});

test('includes the normalized GitLab origin in repository identity', () => {
  const rows = [
    {
      entityId: 'gitlab-origin-project',
      status: 'published',
      primaryUrl: 'https://gitlab-origin-project.example',
      aliases: ['https://gitlab.com/group/subgroup/project'],
    },
  ];

  assert.equal(
    resolveSubmittedUrl(
      'https://gitlab.com/group/subgroup/project/-/issues',
      rows,
    ).kind,
    'suspected-duplicate',
  );
  assert.deepEqual(
    resolveSubmittedUrl(
      'https://gitlab.com:8443/group/subgroup/project/-/issues',
      rows,
    ),
    {
      kind: 'new-link',
      normalizedUrl:
        'https://gitlab.com:8443/group/subgroup/project/-/issues',
    },
  );
});

test('returns new-link for a verifiable URL with no URL-based match', () => {
  assert.deepEqual(resolveSubmittedUrl('https://brand-new.example/tool', aliasRows), {
    kind: 'new-link',
    normalizedUrl: 'https://brand-new.example/tool',
  });
});

test('contains invalid submitted URLs as unverifiable UI results', () => {
  assert.deepEqual(resolveSubmittedUrl('http', aliasRows), {
    kind: 'unverifiable',
    reason: 'Identity URL host is not publicly verifiable.',
  });
  assert.deepEqual(resolveSubmittedUrl('https://127.0.0.1/admin', aliasRows), {
    kind: 'unverifiable',
    reason: 'Identity URL host is not publicly verifiable.',
  });
});

test('does not mutate submitted input, rows, aliases, or row objects', () => {
  const aliases = Object.freeze(['HTTPS://WWW.EXAMPLE.COM:443/old#fragment']);
  const row = Object.freeze({
    entityId: 'immutable',
    status: 'published',
    primaryUrl: 'HTTPS://WWW.EXAMPLE.COM:443/',
    aliases,
    canonicalName: 'Immutable',
  });
  const rows = Object.freeze([row]);
  const input = ' HTTPS://WWW.EXAMPLE.COM:443/old#other ';
  const before = JSON.stringify(rows);

  assert.equal(resolveSubmittedUrl(input, rows).kind, 'known-alias');
  assert.equal(input, ' HTTPS://WWW.EXAMPLE.COM:443/old#other ');
  assert.equal(JSON.stringify(rows), before);
});

test('rebuilds resolver indexes after mutable rows change', () => {
  const rows = [
    {
      entityId: 'mutable',
      status: 'candidate',
      primaryUrl: 'https://before-change.example',
      aliases: [],
    },
  ];

  assert.equal(
    resolveSubmittedUrl('https://before-change.example', rows).kind,
    'candidate',
  );

  rows[0].primaryUrl = 'https://after-change.example';

  assert.equal(
    resolveSubmittedUrl('https://after-change.example', rows).kind,
    'candidate',
  );
  assert.equal(
    resolveSubmittedUrl('https://before-change.example', rows).kind,
    'new-link',
  );
});

test('reuses a resolver index only for a deeply frozen rows snapshot', () => {
  let primaryUrlReads = 0;
  const aliases = Object.freeze([]);
  const row = Object.freeze({
    entityId: 'deeply-frozen',
    status: 'published',
    get primaryUrl() {
      primaryUrlReads += 1;
      return 'https://deeply-frozen.example';
    },
    aliases,
  });
  const rows = Object.freeze([row]);

  assert.equal(
    resolveSubmittedUrl('https://deeply-frozen.example', rows).kind,
    'published',
  );
  const readsAfterFirstResolution = primaryUrlReads;

  assert.equal(
    resolveSubmittedUrl('https://deeply-frozen.example', rows).kind,
    'published',
  );
  assert.equal(primaryUrlReads, readsAfterFirstResolution);
});

test('rejects malformed resolver rows explicitly', () => {
  assert.throws(() => resolveSubmittedUrl('https://example.com', {}), {
    name: 'TypeError',
    message: 'Resolver rows must be an array.',
  });
  assert.throws(
    () =>
      resolveSubmittedUrl('https://example.com', [
        {
          entityId: 'bad-status',
          status: 'draft',
          primaryUrl: 'https://example.com',
          aliases: [],
        },
      ]),
    {
      name: 'TypeError',
      message:
        'Resolver row at index 0 status must be "published" or "candidate".',
    },
  );
  assert.throws(
    () =>
      resolveSubmittedUrl('https://example.com', [
        {
          entityId: 'bad-alias',
          status: 'published',
          primaryUrl: 'https://example.com',
          aliases: ['https://localhost'],
        },
      ]),
    {
      name: 'TypeError',
      message: 'Resolver row at index 0 has an unverifiable alias at index 0.',
    },
  );
});

test('rejects a sparse resolver rows array with the missing row index', () => {
  assert.throws(
    () => resolveSubmittedUrl('https://example.com', new Array(1)),
    {
      name: 'TypeError',
      message: 'Resolver row at index 0 must be an object.',
    },
  );
});

test('rejects a sparse aliases array with both row and alias indexes', () => {
  assert.throws(
    () =>
      resolveSubmittedUrl('https://example.com', [
        {
          entityId: 'sparse-alias',
          status: 'published',
          primaryUrl: 'https://example.com',
          aliases: new Array(1),
        },
      ]),
    {
      name: 'TypeError',
      message: 'Resolver row at index 0 has an unverifiable alias at index 0.',
    },
  );
});

test('rejects duplicate entity rows and normalized URL ownership conflicts', () => {
  assert.throws(
    () =>
      resolveSubmittedUrl('https://new.example', [
        {
          entityId: 'duplicate',
          status: 'published',
          primaryUrl: 'https://one.example',
          aliases: [],
        },
        {
          entityId: 'duplicate',
          status: 'candidate',
          primaryUrl: 'https://two.example',
          aliases: [],
        },
      ]),
    {
      name: 'TypeError',
      message: 'Resolver entityId "duplicate" is duplicated.',
    },
  );

  assert.throws(
    () =>
      resolveSubmittedUrl('https://new.example', [
        {
          entityId: 'first',
          status: 'published',
          primaryUrl: 'https://example.com?utm_source=directory',
          aliases: [],
        },
        {
          entityId: 'second',
          status: 'candidate',
          primaryUrl: 'https://other.example',
          aliases: ['https://www.example.com/'],
        },
      ]),
    {
      name: 'TypeError',
      message:
        'Resolver URL "https://example.com" is assigned to multiple entities.',
    },
  );
});
