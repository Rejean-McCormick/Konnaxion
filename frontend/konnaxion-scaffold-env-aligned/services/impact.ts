export async function fetchImpactOutcomes() {
  return { kpis: [{ label: 'CO₂ Saved', value: 12.3, delta: 5 }],
           charts: [{ title: 'Monthly CO₂ Saved', type: 'bar', config: { data: [{x: 'Sep', y: 8},{x: 'Oct', y: 12.3}], xField: 'x', yField: 'y' } }] };
}
export async function fetchImpactTracker() {
  return { items: [
      { id: '1', title: 'Green Hosting Migration', owner: 'Alice', status: 'In-Progress', updatedAt: '2025-10-20' },
      { id: '2', title: 'Paperless Initiative', owner: 'Bob', status: 'Planned', updatedAt: '2025-10-10' },
    ]};
}
export async function patchImpactStatus(_id: string, _status: 'Planned' | 'In-Progress' | 'Completed' | 'Blocked') { return; }
