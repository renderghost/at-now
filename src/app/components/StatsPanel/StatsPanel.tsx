import React from 'react';
import { mergeClasses } from '@/app/lib/mergeClasses';
import { TITLE, statGroups } from './StatsPanel.constants';
import * as styles from './StatsPanel.styles';
import type { StatsPanelProps } from './StatsPanel.types';

/** Top-line numbers, grouped. */
export const StatsPanel: React.FC<StatsPanelProps> = ({ stats, profile, footprint }) => {
  const groups = statGroups(stats, profile, footprint);
  if (!groups.length) return null;

  return (
    <section className={styles.wrapper} aria-labelledby="at-a-glance">
      <p id="at-a-glance" className={styles.title}>
        {TITLE}
      </p>
      <div className={styles.grid}>
        {groups.map((group) => (
          <div key={group.title} className={styles.group}>
            <p className={styles.groupTitle}>{group.title}</p>
            <dl className={styles.list}>
              {group.stats.map((stat) => (
                <div key={stat.label} className={mergeClasses(styles.stat, stat.wide && styles.statWide)}>
                  <dt className={styles.label}>{stat.label}</dt>
                  <dd className={styles.value}>{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </section>
  );
};
