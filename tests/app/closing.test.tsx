// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { AboutBlock } from '@/app/components/AboutBlock/AboutBlock';
import { ProfileLinks } from '@/app/components/ProfileLinks/ProfileLinks';
import { StatsPanel } from '@/app/components/StatsPanel/StatsPanel';
import { buildNow } from '@/core/buildNow';
import type { NowPayload } from '@/core/types';
import { createFakeSource } from '../helpers/fakeSource';

const NOW = new Date('2026-11-18T12:00:00Z');
let payload: NowPayload;

beforeAll(async () => {
  payload = await buildNow(createFakeSource(), NOW);
});
afterEach(cleanup);

describe('StatsPanel', () => {
  const renderStats = (stats = payload.stats) =>
    render(<StatsPanel stats={stats} profile={payload.profile} />);

  it('shows activity, media and Bluesky numbers', () => {
    renderStats();
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
    ]) {
      const term = within(stats).getByText(label, { exact: true });
      expect(term.parentElement?.textContent).toContain(value);
    }
  });

  it('does not repeat the footprint numbers', () => {
    renderStats();
    expect(screen.queryByText('collections', { exact: true })).toBeNull();
  });

  it('hides zero-valued stats', () => {
    renderStats({ ...payload.stats, eventsUpcoming: 0 });
    expect(screen.queryByText(/coming up/)).toBeNull();
  });

  it('marks capped counts', () => {
    renderStats({ ...payload.stats, appreciatedCapped: true });
    const term = screen.getByText('things appreciated in 30 days', { exact: true });
    expect(term.parentElement?.textContent).toContain('119+');
  });
});

describe('ProfileLinks', () => {
  it('lists profile links in order', () => {
    render(<ProfileLinks links={payload.profile!.links} />);
    const region = screen.getByRole('region', { name: 'Elsewhere' });
    const links = within(region).getAllByRole('link');
    expect(links).toHaveLength(8);
    expect(links[2].textContent).toContain('Homepage');
    expect(links[2].getAttribute('href')).toBe('https://renderg.host/');
  });

  it('renders nothing without links', () => {
    const { container } = render(<ProfileLinks links={[]} />);
    expect(container.innerHTML).toBe('');
  });
});

describe('AboutBlock', () => {
  it('explains the page and credits nownownow.com', () => {
    render(<AboutBlock footprint={payload.footprint} />);
    const about = screen.getByRole('region', { name: 'About this page' });
    expect(within(about).getByText(/what I’m focused on at this point in my life/)).toBeTruthy();
    expect(
      within(about).getByRole('link', { name: 'nownownow.com' }).getAttribute('href')
    ).toBe('https://nownownow.com/about');
    expect(within(about).getByText(/anything from the past week marked Now/)).toBeTruthy();
  });

  it('names the footprint and every app', () => {
    render(<AboutBlock footprint={payload.footprint} />);
    expect(
      screen.getByText('Built live from 34 collections across 16 apps, hosted on eurosky.social:')
    ).toBeTruthy();
    expect(screen.getAllByRole('link').filter((a) => a.textContent !== 'nownownow.com')).toHaveLength(16);
  });

  it('sits in a card', () => {
    const { container } = render(<AboutBlock footprint={payload.footprint} />);
    expect(container.querySelector('[data-card]')).toBeTruthy();
  });
});
