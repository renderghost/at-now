import type { NowPayload, NowProfile, NowStats } from '@/core/types';

export interface StatsPanelProps {
  stats: NowStats;
  profile: NowProfile | null;
  footprint: NowPayload['footprint'];
}

export interface Stat {
  value: string;
  label: string;
  /** Spans both columns of the two-up phone layout (long text values). */
  wide?: boolean;
}

export interface StatGroup {
  title: string;
  stats: Stat[];
}
