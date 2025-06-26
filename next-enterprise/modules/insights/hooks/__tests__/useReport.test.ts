// modules/insights/hooks/__tests__/useReport.test.ts
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useReport } from '../useReport';

test('builds query key correctly', () => {
  const qc = new QueryClient();
  const { result } = renderHook(
    () => useReport('smart-vote', { range: '7d' }),
    { wrapper: ({ children }) => <QueryClientProvider client={qc}>{children}</QueryClientProvider> },
  );
  expect(result.current.queryKey).toEqual(['report', 'smart-vote', { range: '7d' }]);
});
