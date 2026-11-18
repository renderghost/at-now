import React from 'react';
import { AboutBlock } from '@/app/components/AboutBlock/AboutBlock';
import { LoadingState } from '@/app/components/LoadingState/LoadingState';
import { NowFallback } from '@/app/components/NowFallback/NowFallback';
import { NowHero } from '@/app/components/NowHero/NowHero';
import { PageFooter } from '@/app/components/PageFooter/PageFooter';
import { ProfileLinks } from '@/app/components/ProfileLinks/ProfileLinks';
import { SafeBoundary } from '@/app/components/SafeBoundary/SafeBoundary';
import { StatsPanel } from '@/app/components/StatsPanel/StatsPanel';
import { ThemeRenderer } from '@/app/components/ThemeRenderer/ThemeRenderer';
import { useNow } from '@/app/useNow';

export interface AppProps {
  /** Clock override for tests; defaults to the visitor's current time. */
  now?: Date;
}

const App: React.FC<AppProps> = ({ now }) => {
  const { state, data } = useNow();
  const clock = now ?? new Date();

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-whitesmoke">
      <SafeBoundary name="header">
        <NowHero
          profile={data?.profile ?? null}
          status={data?.status ?? null}
          generatedAt={data?.generatedAt}
          now={clock}
        />
      </SafeBoundary>

      <main className="flex flex-col items-start w-full max-w-[1920px] px-24 pt-48 gap-56 pb-128">
        {state === 'loading' && <LoadingState />}
        {state === 'error' && <NowFallback />}
        {state === 'ready' &&
          data.themes.map((theme) => (
            <SafeBoundary key={theme.id} name={theme.id}>
              <ThemeRenderer theme={theme} now={clock} />
            </SafeBoundary>
          ))}
        {state === 'ready' && (
          <div className="flex flex-col gap-48 w-full">
            <SafeBoundary name="stats">
              <StatsPanel stats={data.stats} profile={data.profile} />
            </SafeBoundary>
            {data.profile && (
              <SafeBoundary name="links">
                <ProfileLinks links={data.profile.links} />
              </SafeBoundary>
            )}
            <SafeBoundary name="about">
              <AboutBlock footprint={data.footprint} />
            </SafeBoundary>
          </div>
        )}
      </main>

      <PageFooter />
    </div>
  );
};

export default App;
