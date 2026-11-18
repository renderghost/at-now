import type { AppId } from '@/core/types';

export interface ItemMetaProps {
  /** ISO date the item is placed by. */
  at: string;
  app: AppId;
  now: Date;
  /** Verb before the relative date, e.g. "started" → "started 2 days ago". */
  prefix?: string;
  /** Hide the Now badge (e.g. when the card already shows it). */
  hideBadge?: boolean;
}
