export const getNewsViewState = ({ loading, error, articleCount }) => {
  if (loading) return 'loading';
  if (error) return 'error';
  if (articleCount === 0) return 'empty';
  return 'ready';
};

export const isStaleFeed = (payload) => payload?.stale === true;

// Pagination state is tied to the feed it was set for. Reading it through this
// helper makes a category/search change land on page 1 in the same render, so
// the feed is never requested for the new category at the old page number.
export const feedKeyFor = (category, keywords) => `${category || ''}|${keywords || ''}`;

export const resolvePage = (pageState, feedKey) =>
  pageState && pageState.feedKey === feedKey && pageState.page >= 1 ? pageState.page : 1;
