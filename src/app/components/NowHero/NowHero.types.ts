import type { NowProfile, StatusItem } from '@/core/types';

export interface NowHeroProps {
  profile: NowProfile | null;
  status: StatusItem | null;
  /** When the payload was built (ISO); falls back to `now`. */
  generatedAt?: string;
  now: Date;
}
