// Same origin in production; an isolated preview can supply its backend origin.
export const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || '';
