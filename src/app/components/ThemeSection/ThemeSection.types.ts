import type { ReactNode } from 'react';

export interface ThemeSectionProps {
  /** Used for the heading id. */
  id: string;
  title: string;
  /** Optional one-line summary under the heading. */
  summary?: ReactNode;
  children: ReactNode;
}
