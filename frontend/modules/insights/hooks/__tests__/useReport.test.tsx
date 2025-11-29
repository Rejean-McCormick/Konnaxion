// FILE: frontend/modules/insights/hooks/__tests__/useReport.test.tsx
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useReport } from '../useReport';

// ── mock the shared api instance (relative path = 3 levels up) ────────────────
jest.mock('../../../../shared/api', () => ({
  api: {
    get: jest.fn().mockResolvedValue({
      data: { labels: ['A'], votes: [10], avg_score: [0.7] },
    }),
  },
}));
// ──────────────────────────────────────────────────────────────────────────────

const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });

test('returns mocked report data', async () => {
  const { result } = renderHook(
    () => useReport('smart-vote', { range: '7d' }),
    { wrapper: ({ children }) => <QueryClientProvider client={qc}>{children}</QueryClientProvider> }
  );

  // initial React-Query status is 'pending'
  expect(result.current.status).toBe('pending');

  // wait until data arrives
  await waitFor(() => expect(result.current.data).toBeDefined());

  expect(result.current.data?.votes).toEqual([10]);
});
