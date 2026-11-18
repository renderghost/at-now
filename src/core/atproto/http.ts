/** Minimal JSON-over-HTTP helpers with timeouts and a concurrency limiter. */

export class HttpError extends Error {
  readonly status: number;
  readonly url: string;
  /** XRPC error name from the body, e.g. "RecordNotFound". */
  readonly code?: string;

  constructor(status: number, url: string, code?: string) {
    super(`HTTP ${status}${code ? ` ${code}` : ''} for ${url}`);
    this.name = 'HttpError';
    this.status = status;
    this.url = url;
    this.code = code;
  }
}

export class TimeoutError extends Error {
  constructor(url: string, timeoutMs: number) {
    super(`Timed out after ${timeoutMs}ms: ${url}`);
    this.name = 'TimeoutError';
  }
}

export async function fetchJson<T>(
  url: string,
  opts: { timeoutMs: number; fetchImpl?: typeof fetch }
): Promise<T> {
  const fetchImpl = opts.fetchImpl ?? fetch;
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new TimeoutError(url, opts.timeoutMs));
    }, opts.timeoutMs);
  });

  try {
    const response = await Promise.race([
      fetchImpl(url, {
        signal: controller.signal,
        headers: { accept: 'application/json' },
      }),
      timeout,
    ]);
    if (!response.ok) {
      let code: string | undefined;
      try {
        const body = (await response.json()) as { error?: unknown };
        if (typeof body.error === 'string') code = body.error;
      } catch {
        // Body was not JSON; the status alone describes the failure.
      }
      throw new HttpError(response.status, url, code);
    }
    return (await Promise.race([response.json(), timeout])) as T;
  } finally {
    clearTimeout(timer);
  }
}

/** Runs at most `max` tasks at once; extra tasks queue in call order. */
export function createLimiter(
  max: number
): <T>(task: () => Promise<T>) => Promise<T> {
  let active = 0;
  const queue: (() => void)[] = [];

  const next = () => {
    if (active >= max) return;
    const start = queue.shift();
    if (start) start();
  };

  return <T>(task: () => Promise<T>) =>
    new Promise<T>((resolve, reject) => {
      queue.push(() => {
        active++;
        task()
          .then(resolve, reject)
          .finally(() => {
            active--;
            next();
          });
      });
      next();
    });
}
