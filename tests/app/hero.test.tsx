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
  return render(
    <NowHero profile={data.profile} status={data.status} generatedAt={data.generatedAt} now={NOW} />
  );
};

describe('NowHero', () => {
  it('features the Now title in a yellow card with the full date', () => {
    renderHero();
    const title = screen.getByRole('heading', { level: 1, name: 'Now' });
    const card = title.closest('[data-card]');
    expect(card?.className).toContain('bg-yellow');
    expect(card?.textContent).toContain('Wednesday 18 November 2026');
    expect(card?.textContent).toContain('Refreshed just now from my PDS');
    expect(card?.textContent).toContain('Live');
  });

  it('only pulses for visitors who allow motion', () => {
    const { container } = renderHero();
    const pulse = container.querySelector('[data-part="live-pulse"]');
    expect(pulse?.className).toContain('motion-safe:animate-ping');
    expect(pulse?.className).not.toMatch(/(^|\s)animate-ping/);
  });

  it('sits beside the profile card on wide screens', () => {
    renderHero();
    const feature = screen.getByRole('heading', { level: 1, name: 'Now' }).closest('[data-card]');
    const profile = screen.getByText('B. Prendergast').closest('[data-card]');
    expect(feature?.parentElement?.className).toContain('lg:grid-cols-3');
    expect(profile?.parentElement?.className).toContain('lg:col-span-2');
  });

  it('wraps the Bluesky identity in a card with the banner', () => {
    const { container } = renderHero();
    const card = screen.getByText('B. Prendergast').closest('[data-card]');
    expect(card).toBeTruthy();
    expect(card?.querySelector('img[src*="/img/banner/"]')).toBeTruthy();
    expect(screen.getByRole('img', { name: 'B. Prendergast' })).toBeTruthy();
    expect(
      screen.getByRole('link', { name: '@renderg.host' }).getAttribute('href')
    ).toBe('https://bsky.app/profile/renderg.host');
    expect(screen.getByText(/he\/him/)).toBeTruthy();
    expect(screen.getByText(/Berlin, DE/)).toBeTruthy();
    expect(screen.getByText(/Socialist building a social web/)).toBeTruthy();
    expect(container.querySelector('.bg-blue')).toBeNull();
  });

  it('keeps the explainer, links and stats out of the header', () => {
    renderHero();
    expect(screen.queryByText(/nownownow/)).toBeNull();
    expect(screen.queryByRole('list', { name: 'Profile links' })).toBeNull();
    expect(screen.queryByText('At a glance')).toBeNull();
  });

  it('still renders without a profile', () => {
    renderHero({ profile: null });
    expect(screen.getByRole('heading', { level: 1, name: 'Now' })).toBeTruthy();
    expect(screen.queryByText('B. Prendergast')).toBeNull();
  });
});
