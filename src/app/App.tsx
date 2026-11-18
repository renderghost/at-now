import React from 'react';
import { FootprintBlock } from '@/app/components/FootprintBlock/FootprintBlock';
import { LoadingState } from '@/app/components/LoadingState/LoadingState';
import { NowFallback } from '@/app/components/NowFallback/NowFallback';
import { NowHero } from '@/app/components/NowHero/NowHero';
import { PageFooter } from '@/app/components/PageFooter/PageFooter';
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
      <NowHero
        profile={data?.profile ?? null}
        status={data?.status ?? null}
        stats={data?.stats}
        footprint={data?.footprint}
        now={clock}
      />

      <main className="flex flex-col items-start w-full max-w-[1920px] px-24 pt-48 gap-48 pb-128">
        {state === 'loading' && <LoadingState />}
        {state === 'error' && <NowFallback />}
        {state === 'ready' &&
          data.themes.map((theme) => (
            <ThemeRenderer key={theme.id} theme={theme} now={clock} />
          ))}
        {state === 'ready' && <FootprintBlock footprint={data.footprint} />}
      </main>

      <PageFooter />
    </div>
  );
};

export default App;
