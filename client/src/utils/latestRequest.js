// Tracks which async request is the latest so a slow, older response can never
// overwrite the results of a newer one (e.g. rapid topic switching).
export const createLatestRequestGuard = () => {
  let latest = 0;
  return {
    start: () => ++latest,
    isCurrent: (token) => token === latest,
    invalidate: () => {
      latest += 1;
    },
  };
};
