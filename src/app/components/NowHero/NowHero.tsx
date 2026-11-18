import React from 'react';
import { Link } from '@/app/components/Link/Link';
import { ProfileIdentity } from '@/app/components/ProfileIdentity/ProfileIdentity';
import { StatusLine } from '@/app/components/StatusLine/StatusLine';
import { HOME_URL, NOW_ABOUT_URL, TITLE } from './NowHero.constants';
import * as styles from './NowHero.styles';
import type { NowHeroProps } from './NowHero.types';

/** Identity, what a now page is, and the current status. */
export const NowHero: React.FC<NowHeroProps> = ({ profile, status, now }) => (
  <header className={styles.header}>
    <div className={styles.inner}>
      <div className={styles.topRow}>
        <Link href={HOME_URL} label="renderg.host" color="blue" icon="left" iconChar="←" />
      </div>

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
            . Unlike most, this one writes itself from my open social data on the AT Protocol. It
            covers the last 30 days, with anything from the past week marked Now.
          </p>
          {status && <StatusLine status={status} now={now} />}
        </div>
      </div>
    </div>
  </header>
);
