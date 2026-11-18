import type { AppId } from '@/core/types';

export interface ItemRowProps {
  label: string;
  href?: string;
  detail?: string;
  at: string;
  app: AppId;
  now: Date;
  prefix?: string;
}
