// News providers return outlet identifiers rather than display names ("pcgamer", "the-verge"),
// and article objects spell the source as a string or an object. Resolve one readable label.
const FALLBACK = 'News source';

// Well-known gaming/tech outlets whose slug cannot be title-cased into the real brand name.
const KNOWN_OUTLETS = {
  pcgamer: 'PC Gamer',
  ign: 'IGN',
  gamespot: 'GameSpot',
  gamesradar: 'GamesRadar+',
  eurogamer: 'Eurogamer',
  rockpapershotgun: 'Rock Paper Shotgun',
  videogameschronicle: 'Video Games Chronicle',
  vgc: 'VGC',
  theverge: 'The Verge',
  arstechnica: 'Ars Technica',
  techradar: 'TechRadar',
  tomshardware: "Tom's Hardware",
  tomsguide: "Tom's Guide",
  wccftech: 'Wccftech',
  videocardz: 'VideoCardz',
  venturebeat: 'VentureBeat',
  techcrunch: 'TechCrunch',
  engadget: 'Engadget',
  gizmodo: 'Gizmodo',
  zdnet: 'ZDNet',
  cnet: 'CNET',
  bbc: 'BBC',
  cnn: 'CNN',
  npr: 'NPR',
  nbcnews: 'NBC News',
  cbsnews: 'CBS News',
  abcnews: 'ABC News',
  foxnews: 'Fox News',
  nytimes: 'The New York Times',
};

const rawSource = (article) => {
  const source = article?.source;
  if (typeof source === 'string') return source;
  return source?.name || '';
};

export const formatSourceName = (value) => {
  const text = String(value ?? '').trim();
  if (!text) return FALLBACK;

  const known = KNOWN_OUTLETS[text.toLowerCase().replace(/[^a-z0-9]/g, '')];
  if (known) return known;

  // Only reshape machine-style slugs; a name that already has capitals or spaces is left alone.
  if (/^[a-z0-9]+(?:[-_.][a-z0-9]+)+$/.test(text)) {
    return text
      .split(/[-_.]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  return text;
};

export const getArticleSource = (article) =>
  formatSourceName(rawSource(article) || article?.author);
