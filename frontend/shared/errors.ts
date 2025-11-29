// FILE: frontend/shared/errors.ts
export type ErrorState = { message: string; statusCode?: number };

export class HttpError extends Error {
  statusCode?: number;
  data?: unknown;
  constructor(message: string, opts?: { statusCode?: number; data?: unknown; cause?: unknown }) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = opts?.statusCode;
    this.data = opts?.data;
    // @ts-ignore
    if (opts?.cause !== undefined) this.cause = opts.cause;
  }
}

function isAxiosError(e: any): e is { isAxiosError: boolean; message: string; response?: { status?: number; data?: any } } {
  return !!e && typeof e === 'object' && 'isAxiosError' in e;
}

export function isHttpError(e: unknown): e is HttpError {
  return e instanceof HttpError;
}

export function normalizeError(e: unknown): ErrorState {
  if (isHttpError(e)) return { message: e.message, statusCode: e.statusCode };
  if (isAxiosError(e)) {
    const statusCode = e.response?.status;
    const message = e.response?.data?.message ?? e.message ?? 'Unexpected error';
    return { message, statusCode };
  }
  if (e instanceof Error) return { message: e.message };
  return { message: 'Unexpected error' };
}
