import React from 'react';
import { FootprintBlock } from '@/app/components/FootprintBlock/FootprintBlock';
import { Link } from '@/app/components/Link/Link';
import { LoadingState } from '@/app/components/LoadingState/LoadingState';
import { NowFallback } from '@/app/components/NowFallback/NowFallback';
import { NowIntro } from '@/app/components/NowIntro/NowIntro';
import { PageFooter } from '@/app/components/PageFooter/PageFooter';
import { ThemeRenderer } from '@/app/components/ThemeRenderer/ThemeRenderer';
import { useNow } from '@/app/useNow';

const HOME_URL = 'https://renderg.host/';

export interface AppProps {
  /** Clock override for tests; defaults to the visitor's current time. */
  now?: Date;
}

const App: React.FC<AppProps> = ({ now }) => {
  const { state, data } = useNow();
  const clock = now ?? new Date();

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-whitesmoke">
      <header className="flex w-full max-w-[1920px] px-24 py-16">
        <Link href={HOME_URL} label="renderg.host" color="blue" icon="left" iconChar="←" />
      </header>

      <main className="flex flex-col items-start w-full max-w-[1920px] px-24 pt-24 gap-48 pb-128">
        <NowIntro status={data?.status ?? null} now={clock} />

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
