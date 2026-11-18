// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { NowHero } from '@/app/components/NowHero/NowHero';
import { buildNow } from '@/core/buildNow';
import type { NowPayload } from '@/core/types';
import { createFakeSource } from '../helpers/fakeSource';

const NOW = new Date('2026-11-18T12:00:00Z');
let payload: NowPayload;

beforeAll(async () => {
  payload = await buildNow(createFakeSource(), NOW);
});
afterEach(cleanup);

const renderHero = (overrides: Partial<NowPayload> = {}) => {
  const data = { ...payload, ...overrides };
  return render(
    <NowHero
      profile={data.profile}
      status={data.status}
      stats={data.stats}
      footprint={data.footprint}
      now={NOW}
    />
  );
};

describe('NowHero identity', () => {
  it('shows name, handle, pronouns and place', () => {
    renderHero();
    expect(screen.getByText('B. Prendergast')).toBeTruthy();
    expect(
      screen.getByRole('link', { name: '@renderg.host' }).getAttribute('href')
    ).toBe('https://bsky.app/profile/renderg.host');
    expect(screen.getByText(/he\/him/)).toBeTruthy();
    expect(screen.getByText(/Berlin, DE/)).toBeTruthy();
  });

  it('shows the bio and profile links', () => {
    renderHero();
    expect(screen.getByText(/Socialist building a social web/)).toBeTruthy();
    const links = screen.getByRole('list', { name: 'Profile links' });
    expect(within(links).getAllByRole('link')).toHaveLength(8);
    expect(
      within(links).getByRole('link', { name: 'Homepage' }).getAttribute('href')
    ).toBe('https://renderg.host/');
  });

  it('shows avatar and banner', () => {
    const { container } = renderHero();
    expect(screen.getByRole('img', { name: 'B. Prendergast' })).toBeTruthy();
    expect(container.querySelector('img[src*="/img/banner/"]')).toBeTruthy();
  });

  it('still renders without a profile', () => {
    renderHero({ profile: null });
    expect(screen.getByRole('heading', { level: 1, name: 'Now' })).toBeTruthy();
    expect(screen.queryByText('B. Prendergast')).toBeNull();
  });
});

describe('NowHero explainer', () => {
  it('explains the now page and credits nownownow.com', () => {
    renderHero();
    expect(screen.getByRole('heading', { level: 1, name: 'Now' })).toBeTruthy();
    expect(screen.getByText(/what I’m focused on at this point in my life/)).toBeTruthy();
    expect(
      screen.getByRole('link', { name: 'nownownow.com' }).getAttribute('href')
    ).toBe('https://nownownow.com/about');
    expect(screen.getByText(/writes itself from my open social data/)).toBeTruthy();
  });
});

describe('NowHero stats', () => {
  it('shows activity, media, Bluesky and footprint numbers', () => {
    renderHero();
    const stats = screen.getByRole('region', { name: 'At a glance' });
    for (const [value, label] of [
      ['64', 'posts this week'],
      ['119', 'things appreciated in 30 days'],
      ['2', 'books on the go'],
      ['13', 'plays in 30 days'],
      ['7', 'tracks published in 30 days'],
      ['1', 'event coming up'],
      ['2,461', 'followers'],
      ['6,168', 'posts'],
      ['Jan 2025', 'on the ATmosphere since'],
      ['34', 'collections'],
      ['16', 'apps'],
      ['eurosky.social', 'hosts my data'],
    ]) {
      const term = within(stats).getByText(label, { exact: true });
      expect(term.parentElement?.textContent).toContain(value);
    }
  });

  it('hides zero-valued stats', () => {
    renderHero({ stats: { ...payload.stats, eventsUpcoming: 0 } });
    const stats = screen.getByRole('region', { name: 'At a glance' });
    expect(within(stats).queryByText(/coming up/)).toBeNull();
  });

  it('marks capped counts', () => {
    renderHero({ stats: { ...payload.stats, appreciatedCapped: true } });
    const term = screen.getByText('things appreciated in 30 days', { exact: true });
    expect(term.parentElement?.textContent).toContain('119+');
  });
});
