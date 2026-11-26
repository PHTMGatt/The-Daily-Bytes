// Turn one ranked feed into a front page: lead, "Top right now" rail, one topic cluster, the rest.

/**
 * @template T
 * @param {T[] | null | undefined} articles feed in server rank order
 * @param {object} options
 * @param {(article: T) => string} options.tagFor badge for a story
 * @param {boolean} [options.withRail] reserve the next stories for the rail (desktop)
 * @param {number} [options.railSize]
 * @param {boolean} [options.withCluster] group the biggest shared tag (combined feeds only)
 * @param {number} [options.clusterMin] stories needed to form a cluster
 * @param {number} [options.clusterMax] stories shown in the cluster
 * @param {string[]} [options.genericTags] fallback tags that never form a cluster ("Gaming")
 * @returns {{ lead: T | null, rail: T[], cluster: { tag: string, items: T[] } | null, latest: T[] }}
 */
export const buildFrontPage = (articles, options) => {
  const {
    tagFor,
    withRail = false,
    railSize = 4,
    withCluster = false,
    clusterMin = 3,
    clusterMax = 4,
    genericTags = [],
  } = options;
  const list = Array.isArray(articles) ? articles : [];
  const lead = list[0] || null;
  const rail = withRail ? list.slice(1, 1 + railSize) : [];
  let rest = list.slice(1 + rail.length);

  let cluster = null;
  if (withCluster) {
    const generic = new Set(genericTags.map((tag) => tag.toLowerCase()));
    const counts = new Map();
    for (const article of rest) {
      const tag = tagFor(article);
      if (!tag || generic.has(tag.toLowerCase())) continue;
      counts.set(tag, (counts.get(tag) || 0) + 1);
    }
    // Biggest group wins; ties go to the tag whose first story ranks highest (Map keeps that order).
    let best = null;
    for (const [tag, count] of counts) {
      if (count >= clusterMin && (!best || count > best.count)) best = { tag, count };
    }
    if (best) {
      const items = rest.filter((article) => tagFor(article) === best.tag).slice(0, clusterMax);
      const picked = new Set(items);
      cluster = { tag: best.tag, items };
      rest = rest.filter((article) => !picked.has(article));
    }
  }

  return { lead, rail, cluster, latest: rest };
};
