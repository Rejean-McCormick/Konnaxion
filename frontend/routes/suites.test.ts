import { detectSuite } from './suites';

describe('detectSuite with World URLs', () => {
  test('resolves the product suite from the World-stripped path', () => {
    expect(detectSuite('/w/demo-alpha/ethikos/insights', null)).toBe('ethikos');
    expect(detectSuite('/w/demo-alpha/reports/perf', null)).toBe('reports');
    expect(detectSuite('/w/demo-alpha/konsensus', null)).toBe('ethikos');
  });

  test('keeps the explicit sidebar override authoritative', () => {
    expect(detectSuite('/w/demo-alpha/konsensus', 'ethikos')).toBe('ethikos');
    expect(detectSuite('/w/demo-alpha/ethikos/insights', 'reports')).toBe('reports');
  });
});
