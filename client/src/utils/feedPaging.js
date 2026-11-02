const headlineKey = (title) =>
  String(title || '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

// Append a freshly loaded page to the stories already on screen. Pages are ranked and
// de-duplicated per provider block on the server, so the same story can still arrive
// again on a later page; drop repeats by URL or headline instead of rendering them twice.
export const mergeArticlePages = (current, incoming) => {
  const merged = Array.isArray(current) ? [...current] : [];
  const urls = new Set(merged.map((article) => article?.url).filter(Boolean));
  const headlines = new Set(merged.map((article) => headlineKey(article?.title)).filter(Boolean));
  let added = 0;

  for (const article of Array.isArray(incoming) ? incoming : []) {
    const url = article?.url;
    const headline = headlineKey(article?.title);
    if (!url || urls.has(url) || (headline && headlines.has(headline))) continue;
    urls.add(url);
    if (headline) headlines.add(headline);
    merged.push(article);
    added += 1;
  }

  return { articles: merged, added };
};

// More stories can exist only while the provider total is not exhausted and the last
// page actually contributed something new.
export const hasMoreStories = ({ page, pageSize, totalResults, added }) =>
  added > 0 && page * pageSize < (Number(totalResults) || 0);
