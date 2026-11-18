import React from 'react';
import { StatusLine } from '@/app/components/StatusLine/StatusLine';
import { INTRO, TITLE } from './NowIntro.constants';
import * as styles from './NowIntro.styles';
import type { NowIntroProps } from './NowIntro.types';

export const NowIntro: React.FC<NowIntroProps> = ({ status, now }) => (
  <div className={styles.wrapper}>
    <h1 className={styles.title}>{TITLE}</h1>
    <p className={styles.intro}>{INTRO}</p>
    {status && <StatusLine status={status} now={now} />}
  </div>
);
