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
  const nowCard = () =>
    screen.getByRole('heading', { level: 1, name: 'Now' }).closest('[data-card]')!;

  it('puts the Now title in a full-width white card with the date', () => {
    const { container } = renderHero();
    const card = nowCard();
    expect(card.className).toContain('bg-white');
    expect(card.textContent).toContain('Wednesday 18 November 2026');
    expect(container.querySelector('.bg-yellow')).toBeNull();
  });

  it('starts the card with the back link', () => {
    renderHero();
    const back = screen.getByRole('link', { name: /^←\s*renderg\.host$/ });
    expect(back.getAttribute('href')).toBe('https://renderg.host/');
    expect(back.closest('[data-card]')).toBe(nowCard());
    expect(nowCard().querySelector('a')).toBe(back);
  });

  it('shows the live dot beside "Last updated"', () => {
    renderHero();
    const label = screen.getByText(/Last updated just now/);
    const pulse = label.closest('p')?.querySelector('[data-part="live-pulse"]');
    expect(pulse).toBeTruthy();
    expect(pulse?.className).toContain('motion-safe:animate-ping');
    expect(pulse?.className).not.toMatch(/(^|\s)animate-ping/);
    expect(nowCard().textContent).not.toContain('Refreshed');
  });

  it('nests the tinted profile card inside the Now card', () => {
    renderHero();
    const profile = screen.getByText('B. Prendergast').closest('[data-card]')!;
    expect(profile).not.toBe(nowCard());
    expect(profile.parentElement?.closest('[data-card]')).toBe(nowCard());
    expect(profile.className).toContain('bg-whitesmoke');
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
