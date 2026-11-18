import { useEffect, useState } from 'react';
import type { NowPayload } from '@/core/types';

export const API_PATH = '/api/now';

export type NowState =
  | { state: 'loading'; data: null }
  | { state: 'ready'; data: NowPayload }
  | { state: 'error'; data: null };

/** Fetches /api/now once. An empty payload counts as an error. */
export function useNow(): NowState {
  const [result, setResult] = useState<NowState>({ state: 'loading', data: null });

  useEffect(() => {
    let active = true;
    fetch(API_PATH, { headers: { accept: 'application/json' } })
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return (await response.json()) as NowPayload;
      })
      .then((data) => {
        if (!active) return;
        const empty = !data.status && !(data.themes?.length ?? 0);
        setResult(empty ? { state: 'error', data: null } : { state: 'ready', data });
      })
      .catch((err: unknown) => {
        console.error('[now] could not load /api/now:', err);
        if (active) setResult({ state: 'error', data: null });
      });
    return () => {
      active = false;
    };
  }, []);

  return result;
}
