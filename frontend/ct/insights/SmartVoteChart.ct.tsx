// FILE: frontend/ct/insights/SmartVoteChart.ct.tsx
import { test, expect } from '@playwright/experimental-ct-react';
import SmartVoteChart from '../../modules/insights/components/SmartVoteChart';

test('renders SmartVoteChart', async ({ mount }) => {
  const cmp = await mount(
    <SmartVoteChart labels={['A']} votes={[1]} scores={[0.5]} />,
  );
  await expect(cmp.locator('canvas')).toHaveCount(1);
});
