import React from 'react';
import { Link } from '@/app/components/Link/Link';
import { NowImage } from '@/app/components/NowImage/NowImage';
import { TITLE } from './ProfileLinks.constants';
import * as styles from './ProfileLinks.styles';
import type { ProfileLinksProps } from './ProfileLinks.types';

/** The links on Barry's Bluesky profile, in the order he set. */
export const ProfileLinks: React.FC<ProfileLinksProps> = ({ links }) => {
  if (!links.length) return null;
  return (
    <section className={styles.wrapper} aria-labelledby="elsewhere">
      <h2 id="elsewhere" className={styles.title}>
        {TITLE}
      </h2>
      <ul className={styles.list}>
        {links.map((link) => (
          <li key={link.url} className={styles.item}>
            {link.iconUrl && <NowImage src={link.iconUrl} alt="" className={styles.icon} />}
            <Link href={link.url} label={link.title} color="blue" />
          </li>
        ))}
      </ul>
    </section>
  );
};
