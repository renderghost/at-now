import React from 'react';
import { Link } from '@/app/components/Link/Link';
import { PageFooter } from '@/app/components/PageFooter/PageFooter';
import { titleStyles } from '@/app/components/SectionHeader/SectionHeader.styles';

const HOME_URL = 'https://renderg.host/';

const App: React.FC = () => {
  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-whitesmoke">
      <header className="flex w-full max-w-[1920px] px-24 py-16">
        <Link
          href={HOME_URL}
          label="renderg.host"
          color="blue"
          icon="left"
          iconChar="←"
        />
      </header>

      <main className="flex flex-col items-start w-full max-w-[1920px] px-24 pt-24 gap-24 pb-128">
        <h1 className={titleStyles}>Now</h1>
      </main>

      <PageFooter />
    </div>
  );
};

export default App;
