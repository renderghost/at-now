// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
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
  return render(<NowHero profile={data.profile} status={data.status} now={NOW} />);
};

describe('NowHero (light, compact)', () => {
  it('shows name, handle, pronouns, place and bio', () => {
    renderHero();
    expect(screen.getByText('B. Prendergast')).toBeTruthy();
    expect(
      screen.getByRole('link', { name: '@renderg.host' }).getAttribute('href')
    ).toBe('https://bsky.app/profile/renderg.host');
    expect(screen.getByText(/he\/him/)).toBeTruthy();
    expect(screen.getByText(/Berlin, DE/)).toBeTruthy();
    expect(screen.getByText(/Socialist building a social web/)).toBeTruthy();
    expect(screen.getByRole('img', { name: 'B. Prendergast' })).toBeTruthy();
  });

  it('leaves out the banner, links and stats', () => {
    const { container } = renderHero();
    expect(container.querySelector('img[src*="/img/banner/"]')).toBeNull();
    expect(screen.queryByRole('list', { name: 'Profile links' })).toBeNull();
    expect(screen.queryByText('At a glance')).toBeNull();
    expect(container.querySelector('.bg-blue')).toBeNull();
  });

  it('explains the now page and credits nownownow.com', () => {
    renderHero();
    expect(screen.getByRole('heading', { level: 1, name: 'Now' })).toBeTruthy();
    expect(screen.getByText(/what I’m focused on at this point in my life/)).toBeTruthy();
    expect(
      screen.getByRole('link', { name: 'nownownow.com' }).getAttribute('href')
    ).toBe('https://nownownow.com/about');
    expect(screen.getByText(/anything from the past week marked Now/)).toBeTruthy();
  });

  it('still renders without a profile', () => {
    renderHero({ profile: null });
    expect(screen.getByRole('heading', { level: 1, name: 'Now' })).toBeTruthy();
    expect(screen.queryByText('B. Prendergast')).toBeNull();
  });
});
