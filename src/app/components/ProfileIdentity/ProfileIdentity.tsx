import React from 'react';
import * as styles from './ProfileIdentity.styles';
import type { ProfileIdentityProps } from './ProfileIdentity.types';

/** Avatar beside name, handle, pronouns, place and bio. */
export const ProfileIdentity: React.FC<ProfileIdentityProps> = ({ profile }) => {
  const name = profile.displayName ?? profile.handle;
  const details = [profile.pronouns, profile.location].filter(Boolean);

  return (
    <div className={styles.wrapper}>
      {profile.avatarUrl && <img src={profile.avatarUrl} alt={name} className={styles.avatar} />}
      <div className={styles.body}>
        <p className={styles.name}>{name}</p>
        <p className={styles.meta}>
          <a href={profile.profileUrl} className={styles.handle} target="_blank" rel="noopener noreferrer">
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
      </div>
    </div>
  );
};
