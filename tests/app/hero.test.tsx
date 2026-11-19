// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { NowHero } from '@/app/components/NowHero/NowHero';
import { buildNow } from '@/core/buildNow';
import type { NowPayload, StatusItem } from '@/core/types';
import { createFakeSource } from '../helpers/fakeSource';

const NOW = new Date('2026-11-18T12:00:00Z');
const GREETING = /^Hi, I’m Barry\s*This is what I’m up to now\.$/;
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

const card = () => screen.getByRole('heading', { level: 1, name: GREETING }).closest('[data-card]')!;

describe('NowHero (greeting)', () => {
  it('greets in the first person', () => {
    renderHero();
    expect(screen.getByRole('heading', { level: 1, name: GREETING })).toBeTruthy();
  });

  it('starts the card with the back link', () => {
    renderHero();
    const back = screen.getByRole('link', { name: /^←\s*renderg\.host$/ });
    expect(back.getAttribute('href')).toBe('https://renderg.host/');
    expect(card().querySelector('a')).toBe(back);
  });

  it('shows the avatar, the date and the live line', () => {
    renderHero();
    expect(screen.getByRole('img', { name: 'B. Prendergast' })).toBeTruthy();
    expect(card().textContent).toContain('Wednesday 18 November 2026');
    const label = screen.getByText(/Last updated just now/);
    const pulse = label.closest('p')?.querySelector('[data-part="live-pulse"]');
    expect(pulse?.className).toContain('motion-safe:animate-ping');
  });

  it('folds handle, pronouns and place into a byline beside the avatar', () => {
    renderHero();
    const handle = screen.getByRole('link', { name: '@renderg.host' });
    expect(handle.getAttribute('href')).toBe('https://bsky.app/profile/renderg.host');
    const byline = handle.closest('[data-part="byline"]')!;
    expect(byline.querySelector('img')?.getAttribute('alt')).toBe('B. Prendergast');
    expect(byline.textContent).toContain('B. Prendergast');
    expect(byline.textContent).toContain('he/him');
    expect(byline.textContent).toContain('Berlin, DE');
    expect(byline.className).not.toContain('bg-whitesmoke');
  });

  it('leaves out the bio', () => {
    renderHero();
    expect(screen.queryByText(/Socialist building a social web/)).toBeNull();
    expect(document.querySelector('[data-part="profile-panel"]')).toBeNull();
  });

  it('shows the status inside the card', () => {
    const status: StatusItem = { key: 's', at: NOW.toISOString(), app: 'status', text: 'is in love' };
    renderHero({ status });
    expect(card().textContent).toContain('Barry is in love');
  });

  it('has no banner and stays on the type scale', () => {
    const { container } = renderHero();
    expect(container.querySelector('img[src*="/img/banner/"]')).toBeNull();
    const h1 = screen.getByRole('heading', { level: 1, name: GREETING });
    expect(h1.className).toContain('text-[40px]');
  });

  it('still greets without a profile', () => {
    renderHero({ profile: null });
    expect(screen.getByRole('heading', { level: 1, name: GREETING })).toBeTruthy();
    expect(screen.queryByRole('img')).toBeNull();
    expect(document.querySelector('[data-part="byline"]')).toBeNull();
  });
});
