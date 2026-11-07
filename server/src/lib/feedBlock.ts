export interface FeedBlock<A = unknown> {
  articles: A[];
  totalResults: number;
}

export const EMPTY_BLOCK_TTL_MS = 60 * 1000;

export type FetchedBlockDecision<A> =
  | { block: FeedBlock<A>; stale: true; cacheTtlMs?: undefined }
  | { block: FeedBlock<A>; stale: false; cacheTtlMs?: number };

/**
 * A provider call can succeed yet return nothing usable (rate-limit quirks, an upstream hiccup, or every
 * article rejected by quality filters). Don't let that blank a feed we already have: serve the previous
 * non-empty block, and keep a genuinely empty result only briefly so the next request retries soon.
 */
export const resolveFetchedBlock = <A>(
  fetched: FeedBlock<A>,
  previous: FeedBlock<A> | undefined,
): FetchedBlockDecision<A> => {
  if (fetched.articles.length > 0) return { block: fetched, stale: false };
  if (previous && previous.articles.length > 0) return { block: previous, stale: true };
  return { block: fetched, stale: false, cacheTtlMs: EMPTY_BLOCK_TTL_MS };
};
