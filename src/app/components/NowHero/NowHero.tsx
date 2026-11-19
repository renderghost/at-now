import React from 'react';
import { Card } from '@/app/components/Card/Card';
import { Link } from '@/app/components/Link/Link';
import { StatusLine } from '@/app/components/StatusLine/StatusLine';
import { formatLongDate, relativeTime } from '@/core/time';
import { GREETING_NAME, HOME_URL, LOADING_LABEL, updatedLabel } from './NowHero.constants';
import * as styles from './NowHero.styles';
import type { NowHeroProps } from './NowHero.types';

/** The greeting card: back link, byline (avatar, name, handle, pronouns, place), first-person title, freshness. */
export const NowHero: React.FC<NowHeroProps> = ({ profile, status, generatedAt, now }) => {
  const built = generatedAt ? new Date(generatedAt) : null;
  const details = profile ? [profile.pronouns, profile.location].filter(Boolean) : [];

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Card>
          <Link href={HOME_URL} label="renderg.host" color="blue" icon="left" iconChar="←" />
          <div className={styles.content}>
            {profile && (
              <div className={styles.byline} data-part="byline">
                {profile.avatarUrl && (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.displayName ?? profile.handle}
                    className={styles.avatar}
                  />
                )}
                <div className={styles.bylineText}>
                  <p className={styles.name}>{profile.displayName ?? profile.handle}</p>
                  <p className={styles.meta}>
                    <a href={profile.profileUrl} className={styles.handle} target="_blank" rel="noopener noreferrer">
                      @{profile.handle}
                    </a>
                    {details.map((d) => (
                      <React.Fragment key={d}>
                        <span aria-hidden="true">·</span>
                        <span>{d}</span>
                      </React.Fragment>
                    ))}
                  </p>
                </div>
              </div>
            )}
            <h1 className={styles.title}>
              Hi, I’m {GREETING_NAME} <span aria-hidden="true">👋</span>
              <br />
              This is what I’m up to now.
            </h1>
            <div className={styles.dateRow}>
              <p className={styles.date}>{formatLongDate(now)}</p>
              <p className={styles.updated}>
                <span className={styles.pulseWrap} aria-hidden="true">
                  <span className={styles.pulse} data-part="live-pulse" />
                  <span className={styles.dot} />
                </span>
                {built ? updatedLabel(relativeTime(built, now)) : LOADING_LABEL}
              </p>
            </div>
            {status && <StatusLine status={status} now={now} />}
          </div>
        </Card>
      </div>
    </header>
  );
};
