import type { AtRecord } from '../atproto/types.js';
import { IDENTITY } from '../config.js';
import type { StatusRecord } from '../lexicons.js';
import { statusEmojiUrl, statusUrl } from '../links.js';
import { isWithinWindow, parseDate, recordDate } from '../time.js';
import type { StatusItem } from '../types.js';
import { newestFirst } from './util.js';

/**
 * The newest status, shown while unexpired. Without an expiry it follows the
 * normal 30-day window. Custom emoji ("custom:…") use the status app's images.
 */
export function selectStatus(
  records: AtRecord<StatusRecord>[],
  now: Date
): StatusItem | null {
  const dated = records
    .map((rec) => ({ rec, at: recordDate(rec) }))
    .filter((d): d is { rec: AtRecord<StatusRecord>; at: Date } => d.at !== null);
  const [latest] = newestFirst(dated, (d) => d.at);
  const text = latest?.rec.value.text;
  if (!latest || !text) return null;

  const { value } = latest.rec;
  const expires = parseDate(value.expires);
  const visible = expires ? now < expires : isWithinWindow(latest.at, now);
  if (!visible) return null;

  const custom = value.emoji?.startsWith('custom:')
    ? value.emoji.slice('custom:'.length)
    : undefined;
  const emoji = value.emoji && !custom ? value.emoji : undefined;

  return {
    key: latest.rec.uri,
    at: latest.at.toISOString(),
    app: 'status',
    href: statusUrl(IDENTITY.handle),
    text,
    emoji,
    emojiUrl: custom ? statusEmojiUrl(custom) : undefined,
    expires: expires?.toISOString(),
  };
}
