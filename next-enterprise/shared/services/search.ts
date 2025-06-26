// File: shared/services/search.ts
export async function runGlobalSearch(q: string) {
  // TODO: plug in your real search backend
  return [
    {
      id: "item-1",
      title: `Result for "${q}" #1`,
      snippet: "A brief snippet…",
      path: "/some/path/1",
    },
  ];
}
