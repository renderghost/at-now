import type { ReactNode } from 'react';

export interface SafeBoundaryProps {
  /** Logged with the error, to say which part failed. */
  name: string;
  children: ReactNode;
}

export interface SafeBoundaryState {
  failed: boolean;
}
