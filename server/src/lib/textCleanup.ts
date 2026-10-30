const NAMED_ENTITIES: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“',
  ndash: '–', mdash: '—', hellip: '…',
};

const decodeEntity = (match: string, body: string) => {
  if (body[0] === '#') {
    const isHex = body[1] === 'x' || body[1] === 'X';
    const code = parseInt(body.slice(isHex ? 2 : 1), isHex ? 16 : 10);
    if (!Number.isInteger(code) || code <= 0 || code > 0x10ffff) return match;
    try {
      return String.fromCodePoint(code);
    } catch {
      return match;
    }
  }
  return NAMED_ENTITIES[body.toLowerCase()] ?? match;
};

// Provider text sometimes carries markup and HTML entities ("Nintendo &amp; Sony",
// "Don&#8217;t"); decode and strip so display and headline matching see real text.
export const cleanProviderText = (value: unknown): string =>
  typeof value !== 'string'
    ? ''
    : value
        .replace(/<[^>]*>/g, ' ')
        .replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, decodeEntity)
        .replace(/\s+/g, ' ')
        .trim();
