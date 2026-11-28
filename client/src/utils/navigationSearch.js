export const getNavigationSearchValue = (search) => {
  const params = new URLSearchParams(search);
  return params.get('q')?.trim() || '';
};

// Header search stays in the hub you are on: Tech searches Tech, everything else searches Gaming.
export const getSearchTargetPath = (pathname) =>
  /^\/tech(?:\/|$)/i.test(String(pathname || '')) ? '/tech' : '/dailybyte';
