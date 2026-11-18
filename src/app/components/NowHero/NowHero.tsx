import React from 'react';
import { Card } from '@/app/components/Card/Card';
import { Link } from '@/app/components/Link/Link';
import { ProfileIdentity } from '@/app/components/ProfileIdentity/ProfileIdentity';
import { StatusLine } from '@/app/components/StatusLine/StatusLine';
import { formatLongDate, relativeTime } from '@/core/time';
import { HOME_URL, LOADING_LABEL, TITLE, updatedLabel } from './NowHero.constants';
import * as styles from './NowHero.styles';
import type { NowHeroProps } from './NowHero.types';

/** One full-width card: back link, the Now title, and Barry's profile card. */
export const NowHero: React.FC<NowHeroProps> = ({ profile, status, generatedAt, now }) => {
  const built = generatedAt ? new Date(generatedAt) : null;

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Card>
          <Link href={HOME_URL} label="renderg.host" color="blue" icon="left" iconChar="←" />
          <div className={styles.grid}>
            <div className={styles.titleBlock}>
              <h1 className={styles.title}>{TITLE}</h1>
              <p className={styles.date}>{formatLongDate(now)}</p>
              <p className={styles.updated}>
                <span className={styles.pulseWrap} aria-hidden="true">
                  <span className={styles.pulse} data-part="live-pulse" />
                  <span className={styles.dot} />
                </span>
                {built ? updatedLabel(relativeTime(built, now)) : LOADING_LABEL}
              </p>
            </div>
            <div className={styles.profileSlot}>
              {profile ? (
                <ProfileIdentity profile={profile} status={status} now={now} />
              ) : (
                status && (
                  <Card tone="tint">
                    <StatusLine status={status} now={now} />
                  </Card>
                )
              )}
            </div>
          </div>
        </Card>
      </div>
    </header>
  );
};
