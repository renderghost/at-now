import type { NowProfile, StatusItem } from '@/core/types';

export interface ProfileIdentityProps {
  profile: NowProfile;
  status: StatusItem | null;
  now: Date;
}
