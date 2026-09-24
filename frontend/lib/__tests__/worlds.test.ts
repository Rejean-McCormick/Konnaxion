import {
  getWorldKeyFromPathname,
  isGlobalApiPath,
  parseWorldPath,
  scopeApiPath,
  resolveWorldWebSocketUrl,
  scopeWorldWebSocketPath,
  stripWorldPrefix,
  switchWorldPath,
  withWorldPath,
} from '../worlds';

describe('World URL helpers', () => {
  test('parses and strips World routes without changing product ownership', () => {
    expect(parseWorldPath('/w/demo-alpha/konsensus')).toEqual({
      key: 'demo-alpha',
      appPath: '/konsensus',
    });
    expect(stripWorldPrefix('/w/demo-alpha/reports/perf')).toBe('/reports/perf');
    expect(getWorldKeyFromPathname('/ethikos/insights')).toBeNull();
  });

  test('builds World hrefs and preserves query/hash suffixes', () => {
    expect(withWorldPath('/konsensus?sidebar=ethikos#live', 'demo-alpha')).toBe(
      '/w/demo-alpha/konsensus?sidebar=ethikos#live',
    );
    expect(withWorldPath('/w/old/ethikos/insights', 'new')).toBe(
      '/w/new/ethikos/insights',
    );
  });

  test('switches World while retaining the current app path', () => {
    expect(switchWorldPath('/w/a/konsensus', 'b')).toBe('/w/b/konsensus');
    expect(switchWorldPath('/', 'b')).toBe('/w/b/ethikos/insights');
  });
});

describe('World API scoping', () => {
  test('keeps control/global APIs outside the World data plane', () => {
    expect(isGlobalApiPath('control/worlds/')).toBe(true);
    expect(isGlobalApiPath('users/me/')).toBe(true);
    expect(isGlobalApiPath('admin/users/')).toBe(true);
    expect(isGlobalApiPath('admin/audit-log/')).toBe(true);
    expect(isGlobalApiPath('admin/stats/')).toBe(true);
    expect(isGlobalApiPath('admin/moderation/')).toBe(false);
  });

  test('scopes World-owned APIs exactly once', () => {
    expect(scopeApiPath('ethikos/topics/', 'demo-alpha')).toBe(
      'w/demo-alpha/ethikos/topics/',
    );
    expect(scopeApiPath('/v1/ekoh/profile/1/', 'demo-alpha')).toBe(
      '/w/demo-alpha/v1/ekoh/profile/1/',
    );
    expect(scopeApiPath('w/demo-alpha/ethikos/topics/', 'demo-alpha')).toBe(
      'w/demo-alpha/ethikos/topics/',
    );
    expect(scopeApiPath('/projects/', 'demo-alpha')).toBe(
      '/w/demo-alpha/projects/',
    );
  });
});


describe('World WebSocket scoping', () => {
  test('builds a release-routed socket path and refuses missing World identity', () => {
    expect(scopeWorldWebSocketPath('/ws/reports/custom', 'demo-alpha')).toBe(
      '/ws/w/demo-alpha/reports/custom',
    );
    expect(scopeWorldWebSocketPath('/ws/reports/custom?preview=1', 'demo-alpha')).toBe(
      '/ws/w/demo-alpha/reports/custom?preview=1',
    );
    expect(scopeWorldWebSocketPath('/ws/w/stale-world/reports/custom', 'demo-alpha')).toBe(
      '/ws/w/demo-alpha/reports/custom',
    );
    expect(scopeWorldWebSocketPath('/ws/reports/custom', null)).toBeNull();
  });

  test('derives a scoped ws URL from the active World browser route', () => {
    window.history.replaceState({}, '', '/w/demo-alpha/reports/custom');
    expect(resolveWorldWebSocketUrl('/ws/reports/custom')).toBe(
      'ws://localhost/ws/w/demo-alpha/reports/custom',
    );
    expect(resolveWorldWebSocketUrl('/ws/reports/custom', 'https://api.example.test/ws/reports/custom')).toBe(
      'wss://api.example.test/ws/w/demo-alpha/reports/custom',
    );
  });
});
