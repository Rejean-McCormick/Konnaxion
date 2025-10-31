export async function fetchPulseHealth() {
  return {
    radarConfig: { data: [{ item: 'Diversity', score: 70 }, { item: 'Inclusion', score: 62 }], xField: 'item', yField: 'score' },
    pieConfig:   { data: [{ type: 'Ethics', value: 48 }, { type: 'Safety', value: 32 }, { type: 'Trust', value: 20 }], angleField: 'value', colorField: 'type' },
  };
}
export async function fetchPulseLiveData() {
  return { counters: [
      { label: 'Active Participants', value: 128, trend: +3, history: [80,90,100,110,128] },
      { label: 'New Debates (24h)', value: 12, trend: -1, history: [10,12,9,13,12] },
    ]};
}
export async function fetchPulseOverview() { return { kpis: [{ label: 'Engagement', value: 76 }], charts: [] }; }
export async function fetchPulseTrends() {
  return { charts: [
      { title: 'Engagement Trend', type: 'line',    config: { data: [{x: 'Mon', y: 20},{x: 'Tue', y: 30}], xField: 'x', yField: 'y' } },
      { title: 'Participation',    type: 'heatmap', config: { data: [{x: 'A', y: '1', value: 2}], xField: 'x', yField: 'y', colorField: 'value' } },
    ]};
}
