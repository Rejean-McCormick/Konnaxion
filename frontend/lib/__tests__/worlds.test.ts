import {
  getUniverseKeyFromHostname,
  getUniverseKeyFromPathname,
  getWorldKeyFromPathname,
  isGlobalApiPath,
  parseWorldPath,
  resolveWorldWebSocketUrl,
  scopeApiPath,
  scopeWorldWebSocketPath,
  stripWorldPrefix,
  switchWorldPath,
  withWorldPath,
} from '../worlds';

describe('Universe/World URL helpers', () => {
  test('parses canonical and legacy World routes', () => {
    expect(parseWorldPath('/u/christianity/w/theology/konsensus')).toEqual({
      universeKey: 'christianity',
      key: 'theology',
      appPath: '/konsensus',
    });
    expect(parseWorldPath('/w/demo-alpha/konsensus')).toEqual({
      universeKey: null,
      key: 'demo-alpha',
      appPath: '/konsensus',
    });
    expect(stripWorldPrefix('/u/mine-x/w/finance/reports/perf')).toBe('/reports/perf');
    expect(getUniverseKeyFromPathname('/u/mine-x/w/finance')).toBe('mine-x');
    expect(getWorldKeyFromPathname('/ethikos/insights')).toBeNull();
  });

  test('builds canonical hrefs and preserves query/hash suffixes', () => {
    expect(withWorldPath('/konsensus?sidebar=ethikos#live', 'theology', 'christianity')).toBe(
      '/u/christianity/w/theology/konsensus?sidebar=ethikos#live',
    );
    expect(withWorldPath('/u/old/w/old/ethikos/insights', 'new-world', 'new-universe')).toBe(
      '/u/new-universe/w/new-world/ethikos/insights',
    );
  });

  test('switches World while retaining portable app paths', () => {
    expect(switchWorldPath('/u/mine-x/w/engineering/konsensus', 'finance')).toBe(
      '/u/mine-x/w/finance/konsensus',
    );
    expect(switchWorldPath('/', 'b')).toBe('/w/b/ethikos/insights');
  });

  test('does not carry release-local ethiKos topic ids across World switches', () => {
    expect(
      switchWorldPath(
        '/u/levis/w/levis-approvisionnement-immobilier/ethikos/deliberate/4',
        'levis-affaires-juridiques-greffe',
      ),
    ).toBe(
      '/u/levis/w/levis-affaires-juridiques-greffe/ethikos/deliberate/elite',
    );

    expect(
      switchWorldPath(
        '/w/levis-approvisionnement-immobilier/ethikos/deliberate/elite',
        'levis-affaires-juridiques-greffe',
      ),
    ).toBe('/w/levis-affaires-juridiques-greffe/ethikos/deliberate/elite');
  });
});

describe('Universe/World API scoping', () => {
  test('keeps control/global APIs outside the data plane', () => {
    expect(isGlobalApiPath('control/universes/')).toBe(true);
    expect(isGlobalApiPath('users/me/')).toBe(true);
    expect(isGlobalApiPath('admin/users/')).toBe(true);
    expect(isGlobalApiPath('admin/moderation/')).toBe(false);
  });

  test('scopes World-owned APIs exactly once', () => {
    expect(scopeApiPath('ethikos/topics/', 'theology', 'christianity')).toBe(
      'u/christianity/w/theology/ethikos/topics/',
    );
    expect(scopeApiPath('/v1/ekoh/profile/1/', 'finance', 'mine-x')).toBe(
      '/u/mine-x/w/finance/v1/ekoh/profile/1/',
    );
    expect(scopeApiPath('u/mine-x/w/finance/ethikos/topics/', 'finance', 'mine-x')).toBe(
      'u/mine-x/w/finance/ethikos/topics/',
    );
  });
});

describe('Universe/World WebSocket scoping', () => {
  test('builds a canonical socket path and refuses missing World identity', () => {
    expect(scopeWorldWebSocketPath('/ws/reports/custom', 'finance', 'mine-x')).toBe(
      '/ws/u/mine-x/w/finance/reports/custom',
    );
    expect(scopeWorldWebSocketPath('/ws/reports/custom', null, 'mine-x')).toBeNull();
  });

  test('derives a scoped ws URL from the active browser route', () => {
    window.history.replaceState({}, '', '/u/mine-x/w/finance/reports/custom');
    expect(resolveWorldWebSocketUrl('/ws/reports/custom')).toBe(
      'ws://localhost/ws/u/mine-x/w/finance/reports/custom',
    );
  });
});

describe('Universe hostname routing', () => {
  test('derives a generic Universe key from one explicit subdomain label', () => {
    expect(getUniverseKeyFromHostname('unesco.konnaxion.com', 'konnaxion.com')).toBe(
      'unesco',
    );
    expect(
      getUniverseKeyFromHostname('kristal-farms.konnaxion.com', 'konnaxion.com'),
    ).toBe('kristal-farms');
  });

  test('does not reinterpret infrastructure or nested hosts as Universes', () => {
    expect(getUniverseKeyFromHostname('konnaxion.com', 'konnaxion.com')).toBeNull();
    expect(getUniverseKeyFromHostname('www.konnaxion.com', 'konnaxion.com')).toBeNull();
    expect(getUniverseKeyFromHostname('x.y.konnaxion.com', 'konnaxion.com')).toBeNull();
    expect(getUniverseKeyFromHostname('other.example', 'konnaxion.com')).toBeNull();
  });
});

