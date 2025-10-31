import { api } from './api';

export async function downloadCsv(endpoint: string, params?: Record<string, any>) {
  const resp = await api.get<ArrayBuffer>(endpoint, { params, responseType: 'arraybuffer' });
  const blob = new Blob([resp.data], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const p = new URLSearchParams(params);
  a.download = (endpoint.replace(/^\//, '').replace(/\//g, '_') + (p.toString() ? '_' + p.toString() : '')) + '.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
