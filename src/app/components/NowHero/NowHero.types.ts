import type { NowProfile, StatusItem } from '@/core/types';

export interface NowHeroProps {
  profile: NowProfile | null;
  status: StatusItem | null;
  now: Date;
}
