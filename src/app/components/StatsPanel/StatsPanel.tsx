import React from 'react';
import { Card } from '@/app/components/Card/Card';
import { TITLE, statGroups } from './StatsPanel.constants';
import * as styles from './StatsPanel.styles';
import type { StatsPanelProps } from './StatsPanel.types';

/** Top-line numbers, grouped; shown at the foot of the page. */
export const StatsPanel: React.FC<StatsPanelProps> = ({ stats, profile }) => {
  const groups = statGroups(stats, profile);
  if (!groups.length) return null;

  return (
    <section className={styles.wrapper} aria-labelledby="at-a-glance">
      <h2 id="at-a-glance" className={styles.title}>
        {TITLE}
      </h2>
      <Card>
      <div className={styles.grid}>
        {groups.map((group) => (
          <div key={group.title} className={styles.group}>
            <p className={styles.groupTitle}>{group.title}</p>
            <dl className={styles.list}>
              {group.stats.map((stat) => (
                <div key={stat.label} className={styles.stat}>
                  <dt className={styles.label}>{stat.label}</dt>
                  <dd className={styles.value}>{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
      </Card>
    </section>
  );
};
