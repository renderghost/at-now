// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import App from '@/app/App';
import { CardNowBook } from '@/app/components/CardNowBook/CardNowBook';
import { CardNowEvent } from '@/app/components/CardNowEvent/CardNowEvent';
import { CardNowTrack } from '@/app/components/CardNowTrack/CardNowTrack';
import { CardNowWriting } from '@/app/components/CardNowWriting/CardNowWriting';
import { ItemMeta } from '@/app/components/ItemMeta/ItemMeta';
import { buildNow } from '@/core/buildNow';
import type { NowPayload } from '@/core/types';
import { createFakeSource } from '../helpers/fakeSource';

const NOW = new Date('2026-11-18T12:00:00Z');
const AT = '2026-11-16T12:00:00.000Z';
let payload: NowPayload;

beforeAll(async () => {
  payload = await buildNow(createFakeSource(), NOW);
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('ItemMeta', () => {
  it('shows no Now badge', () => {
    render(<ItemMeta at={AT} app="bluesky" now={NOW} />);
    expect(screen.queryByText('Now', { exact: true })).toBeNull();
  });

  it('links the app label to the item inside the service', () => {
    render(<ItemMeta at={AT} app="atmorsvp" now={NOW} serviceHref="https://atmo.rsvp/p/x/e/y" />);
    expect(screen.getByRole('link', { name: 'atmo.rsvp' }).getAttribute('href')).toBe(
      'https://atmo.rsvp/p/x/e/y'
    );
  });

  it('falls back to the app home', () => {
    render(<ItemMeta at={AT} app="teal" now={NOW} />);
    expect(screen.getByRole('link', { name: 'teal.fm' }).getAttribute('href')).toBe('https://teal.fm');
  });
});

describe('state badges', () => {
  it('look the same for events and books', () => {
    const { container: event } = render(
      <CardNowEvent
        item={{ key: 'e', at: AT, app: 'atmorsvp', name: 'Conf', startsAt: AT, rsvp: 'going', past: false }}
        now={NOW}
      />
    );
    const eventBadge = event.querySelector('[data-part="state-badge"]');
    cleanup();
    const { container: book } = render(
      <CardNowBook
        item={{ key: 'b', at: AT, app: 'bookhive', title: 'Book', authors: [], status: 'reading' }}
        now={NOW}
      />
    );
    const bookBadge = book.querySelector('[data-part="state-badge"]');
    expect(eventBadge?.textContent).toBe('Going');
    expect(bookBadge?.textContent).toBe('Reading');
    expect(bookBadge?.className).toBe(eventBadge?.className);
  });
});

describe('writing cards', () => {
  it('show the cover as a thumbnail beside the text', () => {
    const { container } = render(
      <CardNowWriting
        item={{ key: 'w', at: AT, app: 'standard', title: 'Caught in a Loop.', publication: { name: 'Annotated' }, coverUrl: 'https://x/c.jpg' }}
        now={NOW}
      />
    );
    expect(container.querySelector('img')?.className).toContain('w-[96px]');
  });
});

describe('music cards', () => {
  it('link to the track, album and artist', () => {
    render(
      <CardNowTrack
        item={{
          key: 't',
          at: AT,
          app: 'plyr',
          title: 'ǔuvvǔulluǔ',
          artist: 'gggiiirrrlllsss',
          album: 'tūnņg',
          href: 'https://plyr.fm/track/1675',
          albumHref: 'https://plyr.fm/u/renderg.host/album/tunng',
          artistHref: 'https://plyr.fm/u/renderg.host',
        }}
        now={NOW}
      />
    );
    expect(screen.getByRole('link', { name: 'ǔuvvǔulluǔ' }).getAttribute('href')).toBe('https://plyr.fm/track/1675');
    expect(screen.getByRole('link', { name: 'tūnņg' }).getAttribute('href')).toBe('https://plyr.fm/u/renderg.host/album/tunng');
    expect(screen.getByRole('link', { name: 'gggiiirrrlllsss' }).getAttribute('href')).toBe('https://plyr.fm/u/renderg.host');
  });
});

describe('page layout', () => {
  const serve = () =>
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(payload), { status: 200 })));

  it('uses first-person section headings', async () => {
    serve();
    render(<App now={NOW} />);
    await screen.findByRole('region', { name: 'I’m working on' });
    const headings = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
    expect(headings.slice(0, 9)).toEqual([
      'I’m working on',
      'I’m going to',
      'I’m writing',
      'I’m making',
      'I’m reading',
      'I’m listening to',
      'I’m posting',
      'I’m saving',
      'I’m connecting with',
    ]);
  });

  it('is a single column with a max width', async () => {
    serve();
    render(<App now={NOW} />);
    await screen.findByRole('region', { name: 'I’m working on' });
    const main = screen.getByRole('main');
    expect(main.className).toMatch(/max-w-\[\d+px\]/);
    const multi = [...main.querySelectorAll('section > ul, section > div')].filter((el) =>
      /(?:^|\s)(?:[a-z]+:)?(?:grid-cols-[2-9]|columns-[2-9])/.test(el.getAttribute('class') ?? '')
    );
    expect(multi.map((el) => el.getAttribute('class'))).toEqual([]);
  });

  it('shows no Now badges anywhere', async () => {
    serve();
    render(<App now={NOW} />);
    const posting = await screen.findByRole('region', { name: 'I’m posting' });
    expect(within(posting).queryByText('Now', { exact: true })).toBeNull();
  });
});
