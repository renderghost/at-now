// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { CardNowBook } from '@/app/components/CardNowBook/CardNowBook';
import { CardNowEvent } from '@/app/components/CardNowEvent/CardNowEvent';
import { CardNowPosition } from '@/app/components/CardNowPosition/CardNowPosition';
import { CardNowWriting } from '@/app/components/CardNowWriting/CardNowWriting';
import type { BookItem, EventItem, PositionItem, WritingItem } from '@/core/types';

const NOW = new Date('2026-11-18T12:00:00Z');
afterEach(cleanup);

describe('CardNowPosition', () => {
  const item: PositionItem = {
    key: 'p1',
    at: '2026-11-01T00:00:00.000Z',
    app: 'sifa',
    title: 'User Experience Design Specialist',
    company: 'Atmosphere Community Cooperative',
    location: 'Berlin, State of Berlin, DE',
    workplaceType: 'remote',
    startedAt: '2026-11-01T00:00:00.000Z',
  };

  it('shows the role, company and start month without a Current badge', () => {
    render(<CardNowPosition item={item} now={NOW} />);
    expect(screen.getByText('User Experience Design Specialist')).toBeTruthy();
    expect(screen.getByText(/Atmosphere Community Cooperative/)).toBeTruthy();
    expect(screen.getByText(/Nov 2026 –/)).toBeTruthy();
    expect(screen.queryByText('Current')).toBeNull();
    expect(screen.getByText(/started/)).toBeTruthy();
  });
});

describe('CardNowEvent', () => {
  const base: EventItem = {
    key: 'e1',
    at: '2027-04-29T07:00:00.000Z',
    app: 'smokesignal',
    href: 'https://smokesignal.events/x/y',
    name: 'AtmosphereConf 2027',
    startsAt: '2027-04-29T07:00:00.000Z',
    rsvp: 'going',
    past: false,
  };

  it('renders without dangling separators when location and end are missing', () => {
    const { container } = render(<CardNowEvent item={base} now={NOW} />);
    expect(screen.getByText('AtmosphereConf 2027')).toBeTruthy();
    expect(screen.getByText('Going')).toBeTruthy();
    const meta = container.querySelector('[data-part="event-meta"]');
    expect(meta?.textContent?.trim().startsWith('·')).toBe(false);
    expect(meta?.textContent?.trim().endsWith('·')).toBe(false);
  });

  it('marks past events', () => {
    render(
      <CardNowEvent
        item={{ ...base, name: 'Launch', rsvp: 'interested', past: true, at: '2026-11-04T09:00:00.000Z', startsAt: '2026-11-04T09:00:00.000Z' }}
        now={NOW}
      />
    );
    expect(screen.getByText('Interested')).toBeTruthy();
    expect(screen.getByText(/^was /)).toBeTruthy();
  });
});

describe('CardNowWriting', () => {
  it('labels the publication and links the title', () => {
    const item: WritingItem = {
      key: 'w1',
      at: '2026-10-20T00:00:00.000Z',
      app: 'standard',
      href: 'https://marginalia.leaflet.pub/3mydiq2q6sc2m',
      title: "Knowledge doesn't just accumulate.",
      publication: { name: 'Marginalia', rkey: '3m4di6yzkt22z' },
    };
    render(<CardNowWriting item={item} now={NOW} />);
    expect(screen.getByText('Marginalia')).toBeTruthy();
    expect(
      screen.getByRole('link', { name: "Knowledge doesn't just accumulate." }).getAttribute('href')
    ).toBe('https://marginalia.leaflet.pub/3mydiq2q6sc2m');
  });
});

describe('CardNowBook', () => {
  const book: BookItem = {
    key: 'b1',
    at: '2026-08-27T07:44:47.502Z',
    app: 'bookhive',
    title: 'The Word for World Is Forest',
    authors: ['Ursula K. Le Guin'],
    status: 'reading',
  };

  it('uses a placeholder when there is no cover', () => {
    const { container } = render(<CardNowBook item={book} now={NOW} />);
    expect(container.querySelector('img')).toBeNull();
    expect(screen.getByText('Reading')).toBeTruthy();
  });

  it('shows the cover with the title as alt text', () => {
    render(<CardNowBook item={{ ...book, coverUrl: 'https://x/c.jpg' }} now={NOW} />);
    expect(screen.getByRole('img').getAttribute('alt')).toBe('The Word for World Is Forest');
  });
});
