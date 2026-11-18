import React from 'react';
import { Link } from '@/app/components/Link/Link';
import { NowImage } from '@/app/components/NowImage/NowImage';
import * as styles from './ProfileIdentity.styles';
import type { ProfileIdentityProps } from './ProfileIdentity.types';

/** Avatar, name, handle, pronouns, place, bio and profile links. */
export const ProfileIdentity: React.FC<ProfileIdentityProps> = ({ profile }) => {
  const name = profile.displayName ?? profile.handle;
  const details = [profile.pronouns, profile.location].filter(Boolean);

  return (
    <div className={styles.wrapper}>
      {profile.avatarUrl && (
        <img src={profile.avatarUrl} alt={name} className={styles.avatar} />
      )}
      <div className={styles.body}>
        <p className={styles.name}>{name}</p>
        <p className={styles.meta}>
          <a
            href={profile.profileUrl}
            className={styles.handle}
            target="_blank"
            rel="noopener noreferrer"
          >
            @{profile.handle}
          </a>
          {details.map((d) => (
            <React.Fragment key={d}>
              <span className={styles.separator} aria-hidden="true">
                ·
              </span>
              <span>{d}</span>
            </React.Fragment>
          ))}
        </p>
        {profile.bio && <p className={styles.bio}>{profile.bio}</p>}
        {profile.links.length > 0 && (
          <ul className={styles.links} aria-label="Profile links">
            {profile.links.map((link) => (
              <li key={link.url} className={styles.linkItem}>
                {link.iconUrl && <NowImage src={link.iconUrl} alt="" className={styles.linkIcon} />}
                <Link href={link.url} label={link.title} color="white" />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
