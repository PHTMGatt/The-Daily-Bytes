// Every card renders an "Open story" link, so screen-reader link lists show a wall of identical
// names. Give each link its headline and say that it leaves the site in a new tab.
export const getStoryLinkLabel = (title, source) => {
  const headline = String(title || '').replace(/\s+/g, ' ').trim();
  const outlet = String(source || '').replace(/\s+/g, ' ').trim();
  const subject = headline || 'story';
  return `Open ${subject}${outlet ? ` from ${outlet}` : ''} (opens in a new tab)`;
};
