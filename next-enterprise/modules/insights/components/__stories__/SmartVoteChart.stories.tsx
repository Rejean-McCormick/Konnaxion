// modules/insights/components/__stories__/SmartVoteChart.stories.tsx
import { SmartVoteChart } from '../SmartVoteChart';
import type { Meta } from '@storybook/react';

export default {
  component: SmartVoteChart,
  title: 'Insights/SmartVoteChart',
} as Meta;

export const Example = {
  args: {
    data: {
      labels: ['2025-06-01', '2025-06-02'],
      votes: [120, 150],
      avg_score: [0.72, 0.75],
    },
  },
};
