# now.renderg.host — Design

Date: 2026-11-18 · Owner: Barry Prendergast · Repo: `renderghost/at-now`

## 1. Intent

A "Now" page for renderg.host that assembles itself from Barry's AT Protocol
PDS. It answers "what is Barry doing now, or recently?" without hand-editing.
First it ships as a standalone site at `now.renderg.host`. Later, renderg.host
consumes the same data endpoint and renders it with its own components.

A visitor should come away knowing four things:

- **Professional focus:** what he's working on and for whom.
- **Personal life:** what he's reading, listening to, photographing and saving.
- **Where he'll be:** upcoming events.
- **His ATmosphere footprint:** how much of his life runs on open AT Protocol
  apps. This is a statement in itself.

## 2. Goals, non-goals, anti-goals

**Goals**
- Live, self-updating page driven only by public PDS records and public lookups.
- Visually indistinguishable from renderg.host's inner pages (`/career`,
  `/projects`).
- One JSON endpoint (`/api/now`) that renderg.host can reuse later.

**Non-goals**
- Writing to the PDS, authentication or OAuth.
- A dark theme beyond what renderg.host already does.
- Porting anything into the `portfolio` repo now.

**Anti-goals** (a failure even if it technically works)
- It reads like an activity feed or a Bluesky clone, with other people's
  content dominating.
- Stale-looking or misleading dates, e.g. book imports shown as "recently
  read".
- Empty headings, broken cards or error noise shown to visitors.

## 3. Identity and sources

- DID `did:plc:s2rczyxit2v5vzedxqs326ri`, handle `renderg.host`, PDS
  `https://eurosky.social`.
- Records are read with `com.atproto.repo.listRecords` and `getRecord`. No SDK
  is required, matching the portfolio approach.
- Lookups (hydration) use:
  - the Bluesky public AppView `https://public.api.bsky.app`
    (`app.bsky.actor.getProfiles`, `app.bsky.feed.getPosts`, batches of 25);
  - other people's PDSes, resolved from their DID via `plc.directory` (or
    `/.well-known/did.json` for `did:web`).
- Blob URLs:
  - images: `https://cdn.bsky.app/img/feed_thumbnail/plain/{did}/{cid}@jpeg`,
    as the portfolio does;
  - book covers: the PDS `com.atproto.sync.getBlob`, as the portfolio does.

## 4. Time rules

Ages are measured from request time (rolling):

- **Now:** age ≤ 7 days.
- **Recently:** 7 days < age ≤ 30 days.
- **Ignored:** age > 30 days, except where exempt.

**Exempt from the 30-day cut-off** (Barry's choice):
- current positions;
- upcoming events;
- books with status "currently reading";
- an unexpired status record.

**Date fallback:** when a record has no `createdAt`
(e.g. `pub.leaflet.graph.subscription`), derive the timestamp from its TID
record key.

**Empty means hidden.** A theme or sub-block with zero qualifying items is not
rendered. That includes its heading.

## 5. Page structure

The order is fixed and editorial (Barry's choice). Each theme is a section with
the renderg.host overline style (uppercase, tracked).

```
← renderg.host                                   (minimal chrome)

Now
One-line explainer: this page builds itself from my open social data on the
AT Protocol.
[Status line, if unexpired]

WORKING · GOING · WRITING · MAKING · PHOTOGRAPHING · READING · LISTENING ·
POSTING · SAVING · SOCIAL

MADE FROM MY PDS   Built live from N collections across M apps: Bluesky,
Bookhive, Grain, …  (apps linked)

© 2026 Barry Prendergast   Impressum  Privacy   Bluesky Calendar LinkedIn Mail
```

**Item markers** (Barry's choice):
- Now items carry the yellow badge (same style as `CardPosition`'s "Current"
  badge) reading "Now".
- Recently items have no badge.
- Every item shows a relative date ("2 days ago", "in 5 months").

**Density:** at most 5 items per theme or sub-block. Counts and summaries are
always computed over the full window.

**Item style:** mixed.
- Rich cards for anchor content: positions, events, writing, published music,
  photos, books.
- Compact one-line rows for summaries and interactions.

**Footprint** (Barry's choice):
- each item carries a small source-app label linking to that app;
- a "Made from my PDS" footer block;
- the intro explainer sentence.
- Raw pdsls record links: **not** wanted.
- The footer counts the collections and apps **this page reads** (the fixed
  set in §6, about 27 collections across about 15 apps), not the whole PDS. It
  names and links every app. The count covers the whole set read, whether or not
  a collection had activity in the window (Barry's choice).

## 6. Themes and rules

| Theme | Collections | Rule |
| --- | --- | --- |
| Status (intro) | `io.zzstoatzz.status.record` | Newest record, shown only while `now < expires`. Shows the emoji and text. |
| Working | `id.sifa.profile.position` | Every position with no `endedAt`, newest `startedAt` first. Marker from `startedAt`; a month-precision value like `2026-11` means the 1st of that month. Shows title, company, location, workplace type and dates. No "Current" badge: everything in Working is current, so the Now marker and relative start ("started 17 days ago") stay unambiguous. |
| Going | `community.lexicon.calendar.rsvp` → `community.lexicon.calendar.event` | Status going or interested. Upcoming events (any distance ahead; ongoing counts as upcoming) plus past events that ended within the last 30 days. Skip `notgoing` and cancelled events. Upcoming sorted soonest first, then past most recent first. "Now" badge if within ±7 days of the request. Shows name, dates, mode, location and RSVP status. |
| Writing | `site.standard.document` (+ `pub.leaflet.document`) | All publications, Marginalia included, even those not on renderg.host/writing's allowlist. Each is labelled with its publication name (from `site.standard.publication`) and dated by `publishedAt`. A document whose `site` is a plain URL, not a publication record, is labelled with that URL's host. Each item carries its publication rkey so renderg.host can filter later. All 26 leaflet docs duplicate standard docs by record key, so dedupe by rkey with `site.standard` winning. |
| Making | `sh.tangled.repo`, `fm.plyr.track` | Repos dated by `createdAt`. Published music dated by `createdAt`, with artwork (`imageUrl`), title, artist and album. |
| Photographing | `social.grain.gallery`, `social.grain.photo`, `social.grain.gallery.item` | Galleries in the window, each with its photos, grouped through `gallery.item` and ordered by `position`. A gallery card shows its title, location and up to 5 photos. Photos not in any gallery are grouped as loose photos. |
| Reading | `buzz.bookhive.book` | "Smart dates": **reading** is always shown, dated by `startedAt` else `createdAt`. **Finished** is dated by `finishedAt` else `createdAt`. **Want to read** is dated by `createdAt`. **Abandoned** is hidden. Reading first, then by date. Reuse `CardBook`. |
| Listening | `fm.teal.feed.play` | Dated by `playedTime`. Three parts: (a) top artists and top tracks by play count in the window; (b) a "Last played" line from the newest play; (c) published music lives in Making, not here. Plays of his own uploads are **kept**. |
| Posting | `app.bsky.feed.post` | Summary: "Posted N times this week (M replies)". Items: top-level posts only, meaning posts with no `reply`; quote posts count. Latest 5, with external link cards and images rendered. |
| Saving | `network.cosmik.card`, `is.currents.feed.save` | Semble URL cards show title, image and site. A NOTE card attached through `parentCard` becomes the annotation on its URL card. Currents saves show the image with its `originUrl`. |
| Social → Following | `app.bsky.graph.follow`, `social.grain.graph.follow`, `is.currents.graph.follow`, `id.sifa.graph.follow`, `org.tangled.graph.follow` | Count with a per-app breakdown, plus up to 5 resolved profiles (avatar, display name, handle) from the AppView. |
| Social → Subscribed | `site.standard.graph.subscription`, `pub.leaflet.graph.subscription` | Count plus up to 5 resolved publication names. Dedupe on publication URI. |
| Social → Appreciated | `app.bsky.feed.like`, `social.grain.favorite`, `org.tangled.feed.star`, `app.userinput.upvote`, `fm.plyr.like`, `site.standard.graph.recommend`, `place.stream.like` | Count with a per-app breakdown, plus up to 5 resolved highlights (newest first). Subject types without a cheap human-readable lookup count but are not highlighted. |

**Excluded**

| Collection | Reason |
| --- | --- |
| `pub.leaflet.comment` | Barry's choice. |
| `app.userinput.discussion` | Barry's choice. |
| `app.bsky.feed.repost` | Offered after the builder check; Barry declined. |
| `sh.tangled.feed.star` | Duplicate of `org.tangled.feed.star`, written twice by the Tangled migration. |
| Everything else on the PDS | Out of scope. |

Sifa follows, Tangled follows and Streamplace likes were added after the
builder check (Barry's choice).

**Volume (builder's call, verified):** likes run at about 100 a day, so 30 days
is about 3,000 records. Fetching them one page after another would take 20–30
seconds when nothing is cached. Instead, fetch in parallel time slices. The PDS
accepts any TID as a `listRecords` cursor (tested on eurosky), so make one
cursor per day boundary (`TID(now − d days)`). Fetch the slices concurrently,
each paging only until it crosses into the next slice. Total time with nothing
cached: about 2 seconds. Hard cap: 40 pages per collection; if capped, render
the count as "N+". Collections with non-TID keys (RSVPs, recommends, upvotes)
are small, so fetch all pages and sort by date.

## 7. Approaches considered (data layer)

1. **Vercel function + CDN cache** (chosen). `/api/now` fetches, looks up,
   applies the rules and returns one JSON payload with
   `Cache-Control: s-maxage=900, stale-while-revalidate=86400` (15-minute
   freshness, Barry's choice). The page makes one request. renderg.host reuses
   the same endpoint later (`Access-Control-Allow-Origin: *`; the data is
   public).
2. **All in the browser.** Matches the portfolio today, but each visit fires
   roughly 40–80 cross-server requests. It's slow, and fragile when one server
   is slow.
3. **Build-time snapshot plus scheduled redeploys.** Fastest page, but stale by
   design. It also complicates the rolling 7/30-day boundaries.

## 8. Failure behaviour

- Every source fetch and lookup has a timeout of about 4 seconds.
- A failing source hides only its theme or sub-block. Visitors never see error
  copy (Barry's choice).
- Failures are logged in the Vercel function logs and listed in a `diagnostics`
  array in the JSON payload. The page does not render that array.
- If `/api/now` itself fails or returns nothing, the page shows the title, the
  intro line and one neutral sentence linking to renderg.host. It never shows a
  blank screen.
- A lookup failure for a single highlight drops that highlight. The count
  stays.

## 9. Tech decisions

- **Stack:** Vite + React + TypeScript (strict) + Tailwind CSS 3. This matches
  renderg.host and gives it "exactly the same design system".
- **Design system, copied verbatim from `renderghost/portfolio`:**
  `tailwind.config.ts` (colour, spacing, radius and font tokens), the
  `fluidType` plugin, global CSS and the DM font import.
- **Primitives copied verbatim:** `Link`, `PageFooter` (links made absolute to
  `https://renderg.host/...`), `Section`, `SectionHeader`, `Markdown`, and
  `mergeClasses` / `cn`.
- **Cards extended, not copied as-is** (builder's call): `CardPosition`,
  `CardBook`, and any other portfolio card worth reusing (`CardGrainPhoto`,
  `CardArticle`, `CardProject`). They need slots for the Now badge, the
  relative date and the app label. `CardPosition`'s en-US dates and "Current"
  badge don't fit here. Keep their styles; change their structure.
- **Design process** (Barry's choice): there is no Figma design for the new
  cards (events, music, galleries, posts, saved links, compact rows, footprint
  block). Design them in code from the existing tokens and card patterns, then
  send Barry desktop and mobile screenshots for critique.
- **Function** (builder's call): Vercel Node runtime pinned to region `fra1`,
  near eurosky. Each outbound request has a timeout of about 4 seconds;
  `maxDuration` is 30 seconds.
- New components follow the portfolio's 4-file convention
  (`.tsx/.types.ts/.styles.ts/.constants.ts`) and its styling rules: no margin
  utilities, every text has `leading-*`, no inline styles.
- **Visual:** inner-page style (whitesmoke background, black text, blue dotted
  links, white cards, yellow badge). Chrome is minimal: a "← renderg.host"
  breadcrumb, the title and the standard footer. Impressum and Privacy links
  stay (German legal requirement).
- **Code layout:**
  - `api/now.ts`: the Vercel Node function.
  - `src/core/`: pure, framework-free rule logic (time windows, per-theme
    selectors, dedupe, TID decoding), shared by the function and tests.
  - `src/core/sources/`: fetchers and lookups.
  - `src/app/`: the React page.
  - A shared `NowPayload` type is the contract between the function, the page
    and later renderg.host.
- **Clock:** injectable everywhere, for testable time rules.
- **Testing:**
  - Vitest unit tests for all rules, using recorded fixtures (real records
    captured from the PDS) and a fixed clock.
  - Contract test for the payload shape.
  - A manual Playwright screenshot check at desktop and mobile widths before
    sign-off.
- **Dependencies:** pinned to exact versions. The portfolio's `latest` pins are
  not copied.
- **Tooling:** prettier and eslint configs mirror the portfolio (single quotes,
  semicolons, 80 columns).
- **Meta:** title "Now — Barry Prendergast", description, OG tags reusing the
  renderg.host OG image, `lang="en"`, `en_GB` locale. Dates are formatted for
  `en-GB`.
- **Deployment:** Vercel project linked to `renderghost/at-now`. Barry assigns
  the `now.renderg.host` domain and DNS in Vercel; that is outside the code.

## 10. Left to the builder

- Exact copy for the intro line, empty-API fallback and section summaries,
  within renderg.host's voice (British English).
- **App link targets for labels and items:** bsky.app, bookhive.buzz,
  grain.social, plyr.fm, tangled.org, semble.so, currents, teal.fm, the
  publication URL, and the event's own URI or Smoke Signal. Verify each URL
  pattern against the live app; fall back to the app's home page if a deep link
  can't be built.
- **Status emoji:** values like `custom:bufo-blush` are custom images. Resolve
  them from the status app's emoji source if verifiable, otherwise render only
  the text.
- Responsive grid details for cards (follow `/career` and `/projects` at 390px
  and 1440px).
- Loading state styling, within the design system.
