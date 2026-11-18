import type { NowPayload, NowProfile, NowStats, StatusItem } from '@/core/types';

export interface NowHeroProps {
  profile: NowProfile | null;
  status: StatusItem | null;
  /** Absent while loading or when the API failed. */
  stats?: NowStats;
  footprint?: NowPayload['footprint'];
  now: Date;
}
