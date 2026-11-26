import { useEffect, useState } from 'react';

export const PHONE_QUERY = '(max-width: 760px)';

const matches = () => typeof window !== 'undefined' && window.matchMedia(PHONE_QUERY).matches;

/** True at phone widths (same 760px breakpoint as the CSS). Follows resizes and rotation. */
export const useIsPhone = () => {
  const [isPhone, setIsPhone] = useState(matches);

  useEffect(() => {
    const query = window.matchMedia(PHONE_QUERY);
    const update = () => setIsPhone(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return isPhone;
};
