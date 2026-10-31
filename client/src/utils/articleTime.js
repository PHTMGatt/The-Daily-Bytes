const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const FUTURE_SKEW_MS = HOUR_MS;

const formatDate = (date) =>
  date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

// Fresh stories read as "3h ago" so a feed is scannable; older ones fall back to a calendar date.
export const formatPublishedLabel = (value, now = Date.now()) => {
  if (!value) return 'Recent';

  const date = new Date(value);
  const time = date.getTime();
  if (Number.isNaN(time)) return 'Recent';

  const age = now - time;
  if (age < -FUTURE_SKEW_MS) return formatDate(date);
  if (age < MINUTE_MS) return 'Just now';
  if (age < HOUR_MS) return `${Math.floor(age / MINUTE_MS)}m ago`;
  if (age < DAY_MS) return `${Math.floor(age / HOUR_MS)}h ago`;
  if (age < 7 * DAY_MS) return `${Math.floor(age / DAY_MS)}d ago`;
  return formatDate(date);
};
