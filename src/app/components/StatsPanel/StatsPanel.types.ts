import type { NowProfile, NowStats } from '@/core/types';

export interface StatsPanelProps {
  stats: NowStats;
  profile: NowProfile | null;
}

export interface Stat {
  value: string;
  label: string;
}

export interface StatGroup {
  title: string;
  stats: Stat[];
}
