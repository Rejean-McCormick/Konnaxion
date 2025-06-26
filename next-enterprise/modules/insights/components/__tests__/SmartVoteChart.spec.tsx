import { test, expect } from '@playwright/experimental-ct-react';
import { SmartVoteChart } from '../SmartVoteChart';

test('renders SmartVoteChart', async ({ mount }) => {
  const cmp = await mount(
    <SmartVoteChart data={{ labels: ['A'], votes: [1], avg_score: [0.5] }} />,
  );
  // just verify the canvas exists
  await expect(cmp.locator('canvas')).toHaveCount(1);
});
