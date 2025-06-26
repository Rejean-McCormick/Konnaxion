export async function downloadCsv(endpoint: string, params?: Record<string, unknown>) {
  const qs = new URLSearchParams(params as Record<string, string>).toString();
  const url = `/api/reports/${endpoint}?${qs}&format=csv`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("CSV export failed");

  const blob = await res.blob();
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${endpoint}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}
