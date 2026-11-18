import React from 'react';
import { Card } from '@/app/components/Card/Card';
import { Link } from '@/app/components/Link/Link';
import { ProfileIdentity } from '@/app/components/ProfileIdentity/ProfileIdentity';
import { StatusLine } from '@/app/components/StatusLine/StatusLine';
import { formatLongDate, relativeTime } from '@/core/time';
import { HOME_URL, LIVE, TITLE } from './NowHero.constants';
import * as styles from './NowHero.styles';
import type { NowHeroProps } from './NowHero.types';

/** The featured Now card beside Barry's Bluesky profile card. */
export const NowHero: React.FC<NowHeroProps> = ({ profile, status, generatedAt, now }) => {
  const built = generatedAt ? new Date(generatedAt) : null;
  const refreshed = built
    ? `Refreshed ${relativeTime(built, now)} from my PDS`
    : 'Reading my PDS…';

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.topRow}>
          <Link href={HOME_URL} label="renderg.host" color="blue" icon="left" iconChar="←" />
        </div>
        <div className={styles.grid}>
          <Card tone="yellow" className={styles.feature}>
            <p className={styles.live}>
              <span className={styles.pulseWrap} aria-hidden="true">
                <span className={styles.pulse} data-part="live-pulse" />
                <span className={styles.dot} />
              </span>
              {LIVE}
            </p>
            <div className={styles.titleBlock}>
              <h1 className={styles.title}>{TITLE}</h1>
              <p className={styles.date}>{formatLongDate(now)}</p>
              <p className={styles.refreshed}>{refreshed}</p>
            </div>
          </Card>
          <div className={styles.profileSlot}>
            {profile ? (
              <ProfileIdentity profile={profile} status={status} now={now} />
            ) : (
              status && (
                <Card>
                  <StatusLine status={status} now={now} />
                </Card>
              )
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
