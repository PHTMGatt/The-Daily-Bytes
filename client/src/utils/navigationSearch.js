export const getNavigationSearchValue = (search) => {
  const params = new URLSearchParams(search);
  return params.get('q')?.trim() || '';
};
