export const getNewsViewState = ({ loading, error, articleCount }) => {
  if (loading) return 'loading';
  if (error) return 'error';
  if (articleCount === 0) return 'empty';
  return 'ready';
};

export const isStaleFeed = (payload) => payload?.stale === true;
