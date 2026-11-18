// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import App from '@/app/App';
import { buildNow } from '@/core/buildNow';
import type { NowPayload } from '@/core/types';
import { createFakeSource } from '../helpers/fakeSource';

const NOW = new Date('2026-11-18T12:00:00Z');
let payload: NowPayload;

beforeAll(async () => {
  payload = await buildNow(createFakeSource(), NOW);
});

function serve(body: unknown, status = 200) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(JSON.stringify(body), { status }))
  );
}

const section = (name: string) =>
  screen.getByRole('region', { name });

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('Now page', () => {
  it('renders theme sections in order', async () => {
    serve(payload);
    render(<App now={NOW} />);
    await screen.findByRole('region', { name: 'Working' });
    const headings = screen
      .getAllByRole('heading', { level: 2 })
      .map((h) => h.textContent);
    expect(headings).toEqual([
      'Working',
      'Going',
      'Writing',
      'Making',
      'Reading',
      'Listening',
      'Posting',
      'Saving',
      'Social',
      'At a glance',
      'Elsewhere',
      'Made from my PDS',
    ]);
  });

  it('hides empty themes', async () => {
    serve(payload);
    render(<App now={NOW} />);
    await screen.findByRole('region', { name: 'Working' });
    expect(screen.queryByText('Photographing')).toBeNull();
  });

  it('marks recent items with a Now badge', async () => {
    serve(payload);
    render(<App now={NOW} />);
    const posting = await screen.findByRole('region', { name: 'Posting' });
    expect(within(posting).getAllByText('Now', { exact: true }).length).toBeGreaterThan(0);
    expect(within(section('Reading')).queryByText('Now', { exact: true })).toBeNull();
  });

  it('renders the footprint', async () => {
    serve(payload);
    render(<App now={NOW} />);
    const footprint = await screen.findByRole('region', { name: 'Made from my PDS' });
    expect(
      within(footprint).getByText(
        'Built live from 34 collections across 16 apps, hosted on eurosky.social:'
      )
    ).toBeTruthy();
    expect(within(footprint).getAllByRole('link')).toHaveLength(16);
  });

  it('renders the identity header once loaded', async () => {
    serve(payload);
    render(<App now={NOW} />);
    expect(await screen.findByText('B. Prendergast')).toBeTruthy();
    expect(screen.getByRole('region', { name: 'At a glance' })).toBeTruthy();
  });

  it('renders the status line', async () => {
    serve({
      ...payload,
      status: {
        key: 'at://x/io.zzstoatzz.status.record/1',
        at: NOW.toISOString(),
        app: 'status',
        text: 'is in love',
      },
    });
    render(<App now={NOW} />);
    expect(await screen.findByText(/is in love/)).toBeTruthy();
  });

  it('renders fallback when the API fails', async () => {
    serve({ error: 'unavailable' }, 500);
    render(<App now={NOW} />);
    const main = screen.getByRole('main');
    expect(screen.getByRole('heading', { level: 1, name: 'Now' })).toBeTruthy();
    expect(await within(main).findByText(/I can’t fetch what I’ve been up to right now/)).toBeTruthy();
    expect(
      within(main).getByRole('link', { name: 'renderg.host' }).getAttribute('href')
    ).toBe('https://renderg.host/');
  });

  it('renders fallback for an empty payload', async () => {
    serve({ ...payload, themes: [], status: null });
    render(<App now={NOW} />);
    expect(
      await screen.findByText(/I can’t fetch what I’ve been up to right now/)
    ).toBeTruthy();
  });

  it('shows a loading state while fetching', () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>(() => {})));
    render(<App now={NOW} />);
    expect(screen.getByText('Loading')).toBeTruthy();
  });
});
