import type { AppId } from '@/core/types';

export interface AppLabelProps {
  app: AppId;
  /** The item's page inside the app; defaults to the app's home. */
  href?: string;
}
