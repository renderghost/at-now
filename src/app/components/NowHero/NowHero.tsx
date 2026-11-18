import React from 'react';
import { Link } from '@/app/components/Link/Link';
import { NowImage } from '@/app/components/NowImage/NowImage';
import { ProfileIdentity } from '@/app/components/ProfileIdentity/ProfileIdentity';
import { StatsPanel } from '@/app/components/StatsPanel/StatsPanel';
import { StatusLine } from '@/app/components/StatusLine/StatusLine';
import { HOME_URL, NOW_ABOUT_URL, TITLE } from './NowHero.constants';
import * as styles from './NowHero.styles';
import type { NowHeroProps } from './NowHero.types';

/** Identity, what a now page is, current status and top-line numbers. */
export const NowHero: React.FC<NowHeroProps> = ({ profile, status, stats, footprint, now }) => (
  <header className={styles.band}>
    <div className={styles.inner}>
      <div className={styles.topRow}>
        <Link href={HOME_URL} label="renderg.host" color="white" icon="left" iconChar="←" />
      </div>

      {profile?.bannerUrl && (
        <div className={styles.bannerWrapper}>
          <NowImage src={profile.bannerUrl} alt="" className={styles.banner} />
        </div>
      )}

      <div className={styles.content}>
        {profile && <ProfileIdentity profile={profile} />}

        <div className={styles.nowBlock}>
          <h1 className={styles.title}>{TITLE}</h1>
          <p className={styles.explainer}>
            A now page says what I’m focused on at this point in my life, an idea from Derek
            Sivers’{' '}
            <a href={NOW_ABOUT_URL} className={styles.inlineLink} target="_blank" rel="noopener noreferrer">
              nownownow.com
            </a>
            . Unlike most, this one writes itself from my open social data on the AT Protocol:
            “Now” means the last 7 days, “Recently” the last 30.
          </p>
          {status && <StatusLine status={status} now={now} />}
        </div>

        {stats && footprint && <StatsPanel stats={stats} profile={profile} footprint={footprint} />}
      </div>
    </div>
  </header>
);
