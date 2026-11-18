import type { AppId } from '@/core/types';

export interface AppLabelProps {
  app: AppId;
  /** 'onBlue' for use inside the blue hero band. */
  tone?: 'onLight' | 'onBlue';
}
