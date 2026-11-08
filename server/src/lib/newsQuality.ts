import { cleanProviderText } from './textCleanup.js';

export interface NewsQualityArticle {
  title?: unknown;
  url?: unknown;
  description?: unknown;
  published_at?: unknown;
  publishedAt?: unknown;
  source?: unknown;
}

const STOP_WORDS = new Set(['the', 'and', 'for', 'with', 'from', 'into', 'this', 'that']);
const PROFILE_TITLE_BONUS = 6;
const PROFILE_DESCRIPTION_BONUS = 2;
const PROFILE_BONUS_CAP = 24;

const QUERY_PROFILES: Record<string, string[]> = {
  gaming: [
    'witcher', 'cd projekt', 'cdpr', 'nvidia', 'rtx', 'geforce', 'gpu', 'pc', 'hardware',
    'amd', 'radeon', 'steam', 'xbox', 'playstation', 'nintendo', 'ram', 'ddr5', 'ssd',
    'intel', 'ryzen', 'dlss', 'ps5', 'steam deck', 'epic games', 'game pass', 'switch 2',
    'graphics card', 'dram', 'handheld',
    'vram', 'gddr7', 'blackwell', 'rdna', 'fsr', 'ray tracing', 'nvme', 'rog ally',
    'legion go', 'steam machine', 'xbox series',
  ],
  'the witcher 3': ['witcher', 'wild hunt', 'geralt', 'cd projekt', 'cdpr'],
  'nvidia gpu': ['nvidia', 'geforce', 'rtx', 'gpu', 'dlss'],
  'amd gpu': ['amd', 'radeon', 'rdna', 'fsr', 'ryzen', 'gpu', 'graphics card'],
  'gpu prices': ['gpu', 'graphics card', 'rtx', 'geforce', 'radeon'],
  'ram prices': ['ram', 'ddr5', 'dram', 'memory'],
  'ram ssd prices': ['ram', 'ddr5', 'dram', 'memory', 'ssd', 'nvme', 'storage'],
  'pc hardware': [
    'pc', 'hardware', 'gpu', 'cpu', 'ram', 'ddr5', 'ssd', 'nvme', 'motherboard', 'cooling',
    'case', 'monitor',
  ],
  cpu: [
    'cpu', 'processor', 'ryzen', 'x3d', 'core ultra', 'intel', 'amd', 'arrow lake', 'zen',
    'benchmark', 'threadripper', 'gaming',
  ],
  'handheld pc': [
    'handheld', 'steam deck', 'rog ally', 'legion go', 'steamos', 'switch 2', 'msi claw', 'gaming',
  ],
  xbox: ['xbox', 'game pass', 'series x', 'series s', 'microsoft', 'bethesda', 'activision', 'halo', 'forza'],
  playstation: ['playstation', 'ps5', 'ps5 pro', 'sony', 'dualsense', 'psn', 'ps plus', 'first party'],
  nintendo: ['nintendo', 'switch', 'switch 2', 'mario', 'zelda', 'pokemon', 'joy con', 'eshop'],
  steam: ['steam', 'valve', 'steam deck', 'steam machine', 'proton', 'steamos', 'half life', 'counter strike'],
  'intel cpu': ['intel', 'core ultra', 'arc', 'cpu', 'processor', 'xe', 'battlemage', 'arrow lake', 'chip'],
  'call of duty': ['call of duty', 'warzone', 'black ops', 'modern warfare', 'activision', 'cod'],
  fortnite: ['fortnite', 'epic games', 'battle royale', 'unreal engine', 'chapter'],
  'grand theft auto': ['grand theft auto', 'gta', 'rockstar', 'take two', 'red dead'],
  'elden ring': ['elden ring', 'fromsoftware', 'souls', 'shadow of the erdtree', 'bandai namco'],
  'resident evil': ['resident evil', 'capcom', 'monster hunter', 'street fighter', 'devil may cry', 're engine'],
  'final fantasy': ['final fantasy', 'square enix', 'dragon quest', 'kingdom hearts', 'remake', 'jrpg'],
  'assassins creed': ['assassins creed', 'ubisoft', 'far cry', 'rainbow six', 'ubisoft connect', 'tencent'],
  'cyberpunk 2077': ['cyberpunk', 'phantom liberty', 'night city', 'cd projekt', 'cdpr', 'witcher'],
  // Bryen's "My games" row on the gaming hub.
  'assassins creed black flag': ['black flag', 'edward kenway', 'kenway', 'resynced', 'assassins creed', 'ubisoft', 'pirate'],
  'assassins creed shadows': ['shadows', 'naoe', 'yasuke', 'assassins creed', 'ubisoft', 'feudal japan'],
  'crimson desert': ['crimson desert', 'pearl abyss', 'kliff', 'pywel', 'black desert', 'blackspace engine'],
  hitman: ['hitman', 'io interactive', 'agent 47', 'world of assassination', '007 first light', 'ioi'],
  'batman arkham': ['batman', 'arkham', 'rocksteady', 'wb games', 'warner bros games', 'gotham'],
  'far cry': ['far cry', 'ubisoft', 'far cry 7', 'open world', 'shooter'],
  'ark survival': ['ark survival', 'survival ascended', 'survival evolved', 'studio wildcard', 'snail games', 'dinosaur'],
  'rocket league': ['rocket league', 'psyonix', 'rlcs', 'epic games', 'season'],
  'counter strike 2': ['counter strike', 'cs2', 'valve', 'major', 'skins', 'esports'],
  doom: ['doom', 'id software', 'bethesda', 'dark ages', 'doom eternal', 'slayer'],
  minecraft: ['minecraft', 'mojang', 'creeper', 'java edition', 'bedrock', 'mod'],
  pokemon: ['pokemon', 'game freak', 'nintendo', 'pikachu', 'scarlet', 'violet', 'legends'],
  battlefield: ['battlefield', 'ea', 'dice', 'electronic arts', 'battle royale', 'season'],
  esports: ['esports', 'tournament', 'championship', 'league of legends', 'valorant', 'counter strike', 'dota', 'finals'],
  blizzard: ['blizzard', 'diablo', 'overwatch', 'world of warcraft', 'warcraft', 'battle net', 'hearthstone', 'activision'],
  bethesda: ['bethesda', 'starfield', 'elder scrolls', 'fallout', 'skyrim', 'doom', 'id software', 'obsidian'],
  'baldurs gate': ['baldurs gate', 'larian', 'divinity', 'dungeons and dragons', 'dnd', 'crpg', 'patch'],
  'game industry': ['layoffs', 'studio', 'acquisition', 'acquires', 'publisher', 'developer', 'closure', 'earnings', 'union'],
  vr: ['vr', 'virtual reality', 'meta quest', 'quest 3', 'psvr2', 'steamvr', 'vision pro', 'headset', 'valve index'],
  'ai chips': [
    'ai', 'nvidia', 'blackwell', 'gpu', 'accelerator', 'data center', 'hbm', 'inference', 'openai',
    'chip', 'semiconductor', 'tsmc', 'datacenter',
  ],
  roblox: ['roblox', 'robux', 'creator', 'experience', 'moderation', 'child safety', 'developer exchange'],
  'apex legends': ['apex legends', 'respawn', 'electronic arts', 'ea', 'season', 'ranked', 'battle royale', 'legend'],
  helldivers: ['helldivers', 'arrowhead', 'sony', 'playstation', 'super earth', 'warbond', 'patch', 'steam'],
  'hollow knight': ['hollow knight', 'silksong', 'team cherry', 'metroidvania', 'hornet', 'dlc', 'patch'],
  'next gen consoles': ['ps6', 'next gen', 'xbox next', 'project amethyst', 'magnus', 'console', 'playstation', 'xbox', 'amd'],
  'gaming monitor': ['monitor', 'oled', 'refresh rate', 'hz', 'qd oled', 'g sync', 'freesync', 'ultrawide', '4k', 'gaming'],
  'video game releases': ['release', 'launch', 'game', 'gaming', 'steam', 'xbox', 'playstation', 'nintendo'],
};

// Common typed spellings that should reuse a curated profile.
const PROFILE_ALIASES: Record<string, string> = {
  nvidia: 'nvidia gpu',
  rtx: 'nvidia gpu',
  geforce: 'nvidia gpu',
  witcher: 'the witcher 3',
  'witcher 3': 'the witcher 3',
  amd: 'amd gpu',
  radeon: 'amd gpu',
  ryzen: 'amd gpu',
  'gpu price': 'gpu prices',
  gpu: 'gpu prices',
  gpus: 'gpu prices',
  'graphics cards': 'gpu prices',
  'graphics card': 'gpu prices',
  'memory prices': 'ram prices',
  'dram prices': 'ram prices',
  'ddr5 prices': 'ram prices',
  'ssd price': 'ram ssd prices',
  hardware: 'pc hardware',
  ram: 'ram prices',
  ddr5: 'ram prices',
  dram: 'ram prices',
  ssd: 'ram ssd prices',
  nvme: 'ram ssd prices',
  dlss: 'nvidia gpu',
  cpu: 'cpu',
  cpus: 'cpu',
  processor: 'cpu',
  processors: 'cpu',
  handheld: 'handheld pc',
  handhelds: 'handheld pc',
  'rog ally': 'handheld pc',
  'legion go': 'handheld pc',
  'gaming handheld': 'handheld pc',
  'pc gaming': 'gaming',
  'graphics card prices': 'gpu prices',
  'ram price': 'ram prices',
  'ssd prices': 'ram ssd prices',
  'xbox series x': 'xbox',
  'game pass': 'xbox',
  ps5: 'playstation',
  'ps5 pro': 'playstation',
  sony: 'playstation',
  'switch 2': 'nintendo',
  'nintendo switch': 'nintendo',
  'steam deck': 'steam',
  valve: 'steam',
  intel: 'intel cpu',
  'intel arc': 'intel cpu',
  'game releases': 'video game releases',
  cod: 'call of duty',
  warzone: 'call of duty',
  'black ops': 'call of duty',
  'epic games': 'fortnite',
  gta: 'grand theft auto',
  'gta 6': 'grand theft auto',
  'gta vi': 'grand theft auto',
  rockstar: 'grand theft auto',
  fromsoftware: 'elden ring',
  'dark souls': 'elden ring',
  'video games': 'gaming',
  mojang: 'minecraft',
  capcom: 'resident evil',
  'monster hunter': 'resident evil',
  'street fighter': 'resident evil',
  'square enix': 'final fantasy',
  'dragon quest': 'final fantasy',
  ubisoft: 'assassins creed',
  'rainbow six': 'assassins creed',
  'black flag': 'assassins creed black flag',
  'ac black flag': 'assassins creed black flag',
  'assassins creed iv black flag': 'assassins creed black flag',
  'black flag resynced': 'assassins creed black flag',
  'ac shadows': 'assassins creed shadows',
  'pearl abyss': 'crimson desert',
  'hitman 3': 'hitman',
  'hitman world of assassination': 'hitman',
  'io interactive': 'hitman',
  arkham: 'batman arkham',
  'arkham knight': 'batman arkham',
  'arkham origins': 'batman arkham',
  rocksteady: 'batman arkham',
  'far cry 7': 'far cry',
  'ark survival ascended': 'ark survival',
  'ark survival evolved': 'ark survival',
  'ark 2': 'ark survival',
  cs2: 'counter strike 2',
  'counter strike': 'counter strike 2',
  'doom the dark ages': 'doom',
  'doom eternal': 'doom',
  cyberpunk: 'cyberpunk 2077',
  'cd projekt': 'cyberpunk 2077',
  'pokemon go': 'pokemon',
  bf6: 'battlefield',
  'electronic arts': 'battlefield',
  valorant: 'esports',
  'league of legends': 'esports',
  'gaming industry': 'game industry',
  'game studio': 'game industry',
  'game layoffs': 'game industry',
  diablo: 'blizzard',
  overwatch: 'blizzard',
  'world of warcraft': 'blizzard',
  wow: 'blizzard',
  starfield: 'bethesda',
  fallout: 'bethesda',
  skyrim: 'bethesda',
  'elder scrolls': 'bethesda',
  'baldurs gate 3': 'baldurs gate',
  larian: 'baldurs gate',
  zelda: 'nintendo',
  mario: 'nintendo',
  'vr headset': 'vr',
  'virtual reality': 'vr',
  'meta quest': 'vr',
  psvr2: 'vr',
  'ai chip': 'ai chips',
  'ai gpu': 'ai chips',
  'ai hardware': 'ai chips',
  'ai accelerator': 'ai chips',
  'super mario': 'nintendo',
  'roblox games': 'roblox',
  apex: 'apex legends',
  'apex legends season': 'apex legends',
  'helldivers 2': 'helldivers',
  silksong: 'hollow knight',
  'hollow knight silksong': 'hollow knight',
  ps6: 'next gen consoles',
  'next gen console': 'next gen consoles',
  'xbox next': 'next gen consoles',
  'next gen xbox': 'next gen consoles',
  monitor: 'gaming monitor',
  monitors: 'gaming monitor',
  'gaming monitors': 'gaming monitor',
  oled: 'gaming monitor',
};

export const normalizeHeadline = (value: unknown) =>
  String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');

const TRACKING_PARAM = /^(utm_|fbclid$|gclid$|mc_|ref$|ref_src$)/;
const NEAR_DUPLICATE_THRESHOLD = 0.75;
const NEAR_DUPLICATE_MIN_TOKENS = 4;

export const canonicalizeUrl = (value: unknown) => {
  const raw = String(value || '').trim();
  if (!raw) return '';

  try {
    const url = new URL(raw);
    url.hash = '';
    url.hostname = url.hostname.replace(/^www\./, '');
    for (const key of [...url.searchParams.keys()]) {
      if (TRACKING_PARAM.test(key.toLowerCase())) url.searchParams.delete(key);
    }
    url.searchParams.sort();
    if (url.pathname.length > 1) url.pathname = url.pathname.replace(/\/+$/, '');
    return url.toString().replace(/\/$/, '').toLowerCase();
  } catch {
    return raw.toLowerCase();
  }
};

// Article URLs are rendered as links, so only plain web URLs are acceptable.
export const isHttpUrl = (value: unknown) => {
  try {
    const { protocol } = new URL(String(value || '').trim());
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
};

// Syndicated titles often end with " - Outlet"; drop it only when it names the article's own
// source, so genuine subtitles ("Elden Ring - Shadow of the Erdtree") are never altered.
const stripSourceSuffix = (title: unknown, source: unknown) => {
  const text = String(title || '');
  const outlet = normalizeHeadline(source);
  if (!outlet) return text;
  const match = text.match(/^(.*\S)\s+[-–—|:]\s+([^-–—|:]+)$/);
  return match && normalizeHeadline(match[2]) === outlet ? match[1] : text;
};

// Syndicated "Global X Market Size, Share, CAGR 2025-2032" press releases are paid market-research
// promotion, not news. Match only unmistakable report phrasing so genuine "GPU market share" stories stay.
const MARKET_REPORT_TITLE =
  /\bmarket\s+(size|research|report|analysis|forecast|outlook|insights|trends)\b|\b(industry|market)\s+report\b|\bkey\s+players\b|\bmarket\b.*\b(worth|to reach|valued at)\b.*\$/i;
const MARKET_REPORT_CAGR = /\bcagr\b|compound annual growth|forecast period/i;

export const isMarketReportSpam = (article: NewsQualityArticle) =>
  MARKET_REPORT_TITLE.test(String(article.title || '')) ||
  MARKET_REPORT_CAGR.test(`${article.title || ''} ${article.description || ''}`);

// Affiliate-style gambling promotion ("best online casino sites", "no deposit bonus", "sportsbook promo
// codes") is not news. Match only promotional phrasing so reporting on casinos or loot boxes survives.
const GAMBLING_PROMO =
  /\b(online|real[- ]money)\s+(casinos?|slots?|poker|betting)\b|\b(casino|sportsbook|betting)\s+(sites?|apps?|bonus(es)?|promos?)\b|\bno[- ]deposit\b|\bfree\s+spins\b|\b(sportsbook|betting|casino|bonus)\s+(promo\s+)?codes?\b|\bslots?\s+sites?\b/i;

export const isGamblingPromo = (article: NewsQualityArticle) =>
  GAMBLING_PROMO.test(String(article.title || ''));

// Sports-betting tipster posts ("odds, picks and predictions", "best bets", "same game parlay") are
// gambling-affiliate content. Require tipster phrasing, so "the odds of a delay" or "picks up" survive.
const BETTING_TIPS =
  /\b(odds|lines?|spread)\s*(,|and|&)\s*(best\s+bets?|picks?|predictions?|props?)\b|\b(picks?|predictions?)\s*(,|and|&)\s*(odds|best\s+bets?|props?)\b|\bbest\s+bets?\b|\b(same[- ]game\s+)?parlays?\b|\bplayer\s+props?\b|\bbetting\s+(odds|lines?|picks|tips|preview)\b/i;

export const isBettingTipsPost = (article: NewsQualityArticle) =>
  BETTING_TIPS.test(String(article.title || ''));

// Coupon/discount-code listings ("Steam coupon codes", "use code SAVE20 for 20% off") are affiliate
// promotion. Match code-offer phrasing only, so real price cuts, sales and coupon-scam reporting survive.
const COUPON_PROMO =
  /\b(coupon|promo|discount|voucher|referral)\s+codes?\b|\bcoupons?\s+(and|&)\s+(deals|promos?|codes?)\b|\bsave\s+\d+%\s+with\s+(this\s+)?(coupon|code)\b/i;

const COUPON_CODE_OFFER = /\b([Uu]se|[Ww]ith|[Ee]nter|[Aa]pply)\s+(the\s+)?(code|coupon)\s+[A-Z0-9]{4,}\b/;

export const isCouponPromo = (article: NewsQualityArticle) =>
  (COUPON_PROMO.test(String(article.title || '')) || COUPON_CODE_OFFER.test(String(article.title || ''))) && !/\b(scam|fake|phishing|fraud|lawsuit|sues?)\b/i.test(String(article.title || ''));

// Daily puzzle walkthroughs ("Wordle today: hints and answer", "NYT Connections answers #878") repeat
// every day and crowd out real news. Require a puzzle name plus hint/answer phrasing so stories about
// the games themselves ("NYT adds a new Wordle spin-off") are kept.
const PUZZLE_NAME = /\b(wordle|connections|strands|quordle|octordle|spelling bee|the mini|mini crossword|contexto|heardle|nerdle|waffle)\b/i;
const PUZZLE_ANSWER = /\b(hints?|answers?|clues?|solutions?|spangram|today'?s)\b/i;

export const isDailyPuzzlePost = (article: NewsQualityArticle) => {
  const title = String(article.title || '');
  return PUZZLE_NAME.test(title) && PUZZLE_ANSWER.test(title) && /\b(today|daily|#\d+|nov(ember)?|hints?|answers?)\b/i.test(title)
    && !/\b(adds?|launch(es)?|spin-?off|new game|lawsuit|acquir\w*)\b/i.test(title);
};

// Recurring daily-utility posts (lottery numbers, mortgage/refinance rates, horoscopes) are SEO filler
// that repeats every day and has nothing to do with gaming or technology. Match the unmistakable
// phrasing only; "Zodiac Quest" game news or "DRAM rates" hardware stories do not match.
const DAILY_UTILITY_POST =
  /\b(powerball|mega\s+millions|lotto|lottery)\b.*\b(numbers|results|jackpot|drawing)\b|\b(winning|lottery)\s+numbers\b|\b(mortgage|refinance|refi|heloc|cd|savings|apy)\s+rates?\b.*\b(today|current|for)\b|\b(today|current)\b.*\b(mortgage|refinance|refi)\s+rates?\b|\b(daily|your|weekly)\s+horoscope\b|\bhoroscope\s+(today|for)\b/i;

export const isDailyUtilityPost = (article: NewsQualityArticle) =>
  DAILY_UTILITY_POST.test(String(article.title || ''));

// Affiliate shopping roundups ("Best Black Friday gaming deals", "holiday gift guide", "buying guide")
// repeat every shopping season and are link bait, not news. Match roundup phrasing only, so reporting
// on prices, sales events or retailers ("RAM prices jump", "Steam Autumn Sale starts") survives.
const SHOPPING_ROUNDUP =
  /\bgift\s+(guide|ideas)\b|\b(buyer'?s|buying|shopping)\s+guide\b|\b(black friday|cyber monday|prime day|holiday)\b.*\bdeals?\b|\bdeals?\b.*\b(live blog|live updates|roundup|right now|so far)\b|\bbest\b.*\bdeals?\b/i;

// "Best graphics cards for gaming" style buying lists open the headline with "Best <gear>"; real
// news rarely does ("Best Buy ...", "wins best RPG" do not match since gear must follow "best").
const GEAR_NOUN =
  '(?:gaming\\s+|budget\\s+|cheap\\s+|wireless\\s+|mechanical\\s+|pc\\s+)*(?:laptops?|monitors?|graphics\\s+cards?|gpus?|cpus?|processors?|ssds?|hard\\s+drives?|ram|memory|headsets?|headphones|keyboards?|mice|mouse|controllers?|handhelds?|chairs?|desks?|routers?|webcams?|microphones?|capture\\s+cards?|motherboards?|power\\s+supplies|psus?|cases|coolers?|pc\\s+builds?|prebuilt\\s+pcs?|gaming\\s+pcs?|tvs?|consoles?)';
const BEST_GEAR_ROUNDUP = new RegExp(`^\\s*(?:the\\s+)?(?:\\d+\\s+)?best\\s+${GEAR_NOUN}\\b`, 'i');

export const isShoppingRoundup = (article: NewsQualityArticle) =>
  (SHOPPING_ROUNDUP.test(String(article.title || '')) || BEST_GEAR_ROUNDUP.test(String(article.title || ''))) &&
  !/\b(scam|fake|phishing|fraud|lawsuit|sues?|ftc)\b/i.test(String(article.title || ''));

// Single-product retail deal posts ("Deal alert: SSD drops to $119", "headset is $50 off at Best Buy")
// are ephemeral affiliate listings. Require a deal label or a retailer-plus-discount phrasing; price
// reporting ("Nvidia cuts RTX price") and storewide sales ("Steam sale, up to 90% off") survive.
const RETAILERS = '(?:amazon|best\\s*buy|walmart|target|newegg|b&h|micro\\s*center|gamestop|woot)';
const DEAL_LABEL = /^\s*(?:hot\s+)?deals?\s*(?:alert|of the day)?\s*(?::|-|\||–|—)|\bdeal\s+alert\b/i;
const RETAIL_DISCOUNT = new RegExp(
  `(?:\\$\\d[\\d,.]*\\s+off|\\d{1,2}%\\s+off|drops?\\s+to\\s+\\$\\d|save\\s+(?:\\$\\d|\\d{1,2}%)).*\\b(?:at|from|on|via)\\s+${RETAILERS}\\b|\\b(?:at|from|on|via)\\s+${RETAILERS}\\b.*(?:\\$\\d[\\d,.]*\\s+off|\\d{1,2}%\\s+off)`,
  'i',
);

export const isRetailDealPost = (article: NewsQualityArticle) => {
  const title = String(article.title || '');
  return (DEAL_LABEL.test(title) || RETAIL_DISCOUNT.test(title)) &&
    !/\b(scam|fake|phishing|fraud|lawsuit|sues?|ftc|antitrust|acquir\w*)\b/i.test(title);
};

// Paid placements ("Sponsored: ...", "Advertorial") and wire-service press-release outlets are
// promotion, not reporting. Match explicit labels and known paid-release sources only.
const SPONSORED_LABEL = /^\s*[\[(]?\s*(sponsored|advertorial|paid (post|content|partnership)|partner content|promoted)\s*[\])]?\s*(:|-|\||–|—|\]|\))/i;
const PRESS_RELEASE_SOURCES = new Set([
  'pr newswire', 'prnewswire', 'globenewswire', 'globe newswire', 'business wire', 'businesswire',
  'ein presswire', 'einpresswire', 'openpr', 'openpr com', 'accesswire', 'newsfile', 'issuewire',
]);

export const isSponsoredOrPressRelease = (article: NewsQualityArticle) =>
  SPONSORED_LABEL.test(String(article.title || '')) ||
  PRESS_RELEASE_SOURCES.has(normalizeHeadline(article.source));

// Auto-generated investor-wire posts ("<Fund LLC> Buys 1,240 Shares of NVIDIA", "(NASDAQ:NVDA) Price Target Raised")
// flood NVIDIA/AMD/gaming-stock queries without reporting anything about the products.
const INSTITUTION_NAME = /\b(llc|l\.?p\.?|capital|advis(?:o|e)rs?|advisory|management|partners|wealth|investments?|asset|holdings|trust|financial|securities|fund|bancorp|associates)\b/i;
const HOLDINGS_MOVE = /\b(buys?|bought|sells?|sold|acquires?|acquired|purchases?|adds?|trims?|lifts?|boosts?|cuts?|raises?|lowers?|reduces?|grows?|increases?|decreases?|opens?)\b[^|]{0,60}\b(shares|stake|position)\b/i;
const EXCHANGE_TICKER_TAG = /\((?:nasdaq|nyse|nysearca|otcmkts?|otcqx|tsx)\s*:\s*[a-z.]+\)/i;
const STOCK_TICKER_CHATTER = /\b(shares|stock price|price target|rating|gap (?:up|down)|trading (?:up|down)|stock position)\b/i;

export const isInvestorWirePost = (article: NewsQualityArticle) => {
  const title = String(article.title || '');
  return (INSTITUTION_NAME.test(title) && HOLDINGS_MOVE.test(title)) ||
    (EXCHANGE_TICKER_TAG.test(title) && STOCK_TICKER_CHATTER.test(title));
};

// Every non-news category the feed drops (spam, promotion, link bait, daily filler) in one predicate,
// so a new filter is added in a single place and cannot be missed by a caller.
const LOW_VALUE_FILTERS = [
  isMarketReportSpam,
  isGamblingPromo,
  isBettingTipsPost,
  isCouponPromo,
  isShoppingRoundup,
  isRetailDealPost,
  isDailyPuzzlePost,
  isDailyUtilityPost,
  isSponsoredOrPressRelease,
  isInvestorWirePost,
];

export const isLowValueArticle = (article: NewsQualityArticle) =>
  LOW_VALUE_FILTERS.some((filter) => filter(article));

const headlineTokens = (headline: string) =>
  new Set(headline.split(' ').filter((token) => token && !STOP_WORDS.has(token)));

const isNearDuplicate = (a: Set<string>, b: Set<string>) => {
  if (a.size < NEAR_DUPLICATE_MIN_TOKENS || b.size < NEAR_DUPLICATE_MIN_TOKENS) return false;
  let shared = 0;
  for (const token of a) if (b.has(token)) shared += 1;
  return shared / (a.size + b.size - shared) >= NEAR_DUPLICATE_THRESHOLD;
};

const getQueryTokens = (query: string) =>
  normalizeHeadline(query)
    .split(' ')
    .filter((token) => token && !STOP_WORDS.has(token));

// Providers occasionally emit future-dated stories (bad timezone, scheduled posts);
// beyond a small clock-skew allowance the timestamp is untrustworthy, so ignore it.
const FUTURE_SKEW_MS = 60 * 60 * 1000;

const getPublishedTime = (article: NewsQualityArticle, now: number) => {
  const value = article.published_at || article.publishedAt;
  if (!value) return 0;
  const time = new Date(String(value)).getTime();
  return Number.isFinite(time) && time <= now + FUTURE_SKEW_MS ? time : 0;
};

// Treat simple plurals as the same word so "GPUs" matches "gpu" and "console" matches "consoles".
const hasWord = (words: Set<string>, word: string) =>
  words.has(word) ||
  words.has(`${word}s`) ||
  (word.length > 3 && word.endsWith('s') && words.has(word.slice(0, -1)));

const matchesTerm = (normalizedText: string, words: Set<string>, term: string) =>
  term.includes(' ') ? normalizedText.includes(term) : hasWord(words, term);

// Aliases that are also everyday words or abbreviations only count when they are the whole query.
const AMBIGUOUS_ALIASES = new Set(['wow', 'cod', 'sony', 'mario', 'hardware', 'intel', 'valve']);

const PROFILE_LOOKUP: Array<[string, string]> = [
  ...Object.keys(QUERY_PROFILES).map((key): [string, string] => [key, key]),
  ...Object.entries(PROFILE_ALIASES),
]
  .filter(([term]) => !AMBIGUOUS_ALIASES.has(term))
  .sort((a, b) => b[0].length - a[0].length);

// Exact query or alias first; otherwise a typed phrase like "rtx 5090 stock" reuses the profile of
// the longest known term it contains as whole words.
const resolveProfile = (normalizedQuery: string) => {
  const direct = QUERY_PROFILES[PROFILE_ALIASES[normalizedQuery] ?? normalizedQuery];
  if (direct) return direct;

  const padded = ` ${normalizedQuery} `;
  for (const [term, key] of PROFILE_LOOKUP) {
    if (padded.includes(` ${term} `)) return QUERY_PROFILES[key];
  }
  return undefined;
};

const profileBonus = (
  title: string,
  description: string,
  normalizedQuery: string,
  queryTokens: Set<string>,
) => {
  const profile = resolveProfile(normalizedQuery);
  if (!profile) return 0;

  const titleWords = new Set(title.split(' ').filter(Boolean));
  const descriptionWords = new Set(description.split(' ').filter(Boolean));
  let bonus = 0;

  for (const term of profile) {
    if (term === normalizedQuery || (!term.includes(' ') && queryTokens.has(term))) continue;

    if (matchesTerm(title, titleWords, term)) {
      bonus += PROFILE_TITLE_BONUS;
    } else if (matchesTerm(description, descriptionWords, term)) {
      bonus += PROFILE_DESCRIPTION_BONUS;
    }

    if (bonus >= PROFILE_BONUS_CAP) return PROFILE_BONUS_CAP;
  }

  return bonus;
};

const HOUR_MS = 60 * 60 * 1000;
const FRESHNESS_TIERS: Array<[number, number]> = [
  [24 * HOUR_MS, 10],
  [72 * HOUR_MS, 6],
  [7 * 24 * HOUR_MS, 3],
];

const freshnessBonus = (publishedTime: number, now: number) => {
  if (!publishedTime) return 0;
  const age = now - publishedTime;
  if (age < 0) return 0;
  for (const [maxAge, bonus] of FRESHNESS_TIERS) if (age <= maxAge) return bonus;
  return 0;
};

// Months-old coverage should not outrank current stories on a news feed. The demotion only applies
// to stories with a trustworthy timestamp and never drops a match below a score of 1.
const STALENESS_TIERS: Array<[number, number]> = [
  [180 * 24 * HOUR_MS, 30],
  [60 * 24 * HOUR_MS, 18],
  [21 * 24 * HOUR_MS, 8],
];

const stalenessPenalty = (publishedTime: number, now: number) => {
  if (!publishedTime) return 0;
  const age = now - publishedTime;
  for (const [minAge, penalty] of STALENESS_TIERS) if (age >= minAge) return penalty;
  return 0;
};

const relevanceScore = (article: NewsQualityArticle, query: string, tokens: string[]) => {
  const title = normalizeHeadline(article.title);
  const description = normalizeHeadline(article.description);
  const normalizedQuery = normalizeHeadline(query);
  const titleWords = new Set(title.split(' ').filter(Boolean));
  const descriptionWords = new Set(description.split(' ').filter(Boolean));
  const queryTokenSet = new Set(tokens);
  let score = 0;

  const exactTitleMatch = tokens.length === 1
    ? hasWord(titleWords, tokens[0])
    : Boolean(normalizedQuery && title.includes(normalizedQuery));

  if (exactTitleMatch) score += 40;

  let titleMatches = 0;
  for (const token of tokens) {
    if (hasWord(titleWords, token)) {
      score += 12;
      titleMatches += 1;
    } else if (hasWord(descriptionWords, token)) {
      score += 3;
    }
  }

  if (tokens.length > 1 && titleMatches === tokens.length) score += 16;
  score += profileBonus(title, description, normalizedQuery, queryTokenSet);
  return score;
};

const MAX_CONSECUTIVE_PER_SOURCE = 2;

// Stable reorder: defer a story when its source already filled the last slots,
// so one outlet cannot take over the top of the feed. Nothing is dropped.
export const diversifySources = <T extends NewsQualityArticle>(
  articles: T[],
  maxRun: number = MAX_CONSECUTIVE_PER_SOURCE,
): T[] => {
  const sourceOf = (article: T) => String(article.source || '').trim().toLowerCase();
  const pending = [...articles];
  const result: T[] = [];
  let runSource = '';
  let runLength = 0;

  while (pending.length) {
    let pick = pending.findIndex((article) => {
      const source = sourceOf(article);
      return !source || source !== runSource || runLength < maxRun;
    });
    if (pick === -1) pick = 0;
    const [article] = pending.splice(pick, 1);
    const source = sourceOf(article);
    runLength = source && source === runSource ? runLength + 1 : 1;
    runSource = source;
    result.push(article);
  }

  return result;
};

export const rankAndDedupeArticles = <T extends NewsQualityArticle>(
  articles: T[],
  query: string,
  now: number = Date.now(),
): T[] => {
  const cleaned = articles.map((article) => ({
    ...article,
    title: typeof article.title === 'string' ? cleanProviderText(article.title) : article.title,
    description: typeof article.description === 'string'
      ? cleanProviderText(article.description)
      : article.description,
  }));
  const unique: Array<{ article: T; index: number }> = [];
  const seenUrls = new Set<string>();
  const seenHeadlines = new Set<string>();

  cleaned.forEach((article, index) => {
    const url = canonicalizeUrl(article.url);
    const headline = normalizeHeadline(stripSourceSuffix(article.title, article.source));

    if (!headline || !url || !isHttpUrl(article.url) || isLowValueArticle(article) || seenUrls.has(url) || seenHeadlines.has(headline)) return;

    seenUrls.add(url);
    seenHeadlines.add(headline);
    unique.push({ article, index });
  });

  const dropNearDuplicates = (items: T[]) => {
    const kept: T[] = [];
    const keptTokens: Array<Set<string>> = [];
    for (const item of items) {
      const tokens = headlineTokens(normalizeHeadline(stripSourceSuffix(item.title, item.source)));
      if (keptTokens.some((existing) => isNearDuplicate(existing, tokens))) continue;
      kept.push(item);
      keptTokens.push(tokens);
    }
    return kept;
  };

  const tokens = getQueryTokens(query);
  if (!tokens.length) return diversifySources(dropNearDuplicates(unique.map(({ article }) => article)));

  return diversifySources(dropNearDuplicates(unique
    .map(({ article, index }) => {
      const relevance = relevanceScore(article, query, tokens);
      return {
        article,
        index,
        // Freshness only breaks ties among matching stories; it must not lift unrelated ones.
        score: relevance > 0
          ? Math.max(
              1,
              relevance +
                freshnessBonus(getPublishedTime(article, now), now) -
                stalenessPenalty(getPublishedTime(article, now), now),
            )
          : 0,
        publishedTime: getPublishedTime(article, now),
      };
    })
    .sort((a, b) =>
      b.score - a.score ||
      b.publishedTime - a.publishedTime ||
      a.index - b.index
    )
    .map(({ article }) => article)));
};

// The Technology feed has no typed query, so ranking would be purely chronological. Rank it with the
// gaming/hardware profile as a soft boost; it only reorders and never filters what the provider returned.
export const getRankingQuery = (category: string, keywords: string) => {
  if (keywords.trim()) return keywords;
  return category.trim().toLowerCase() === 'technology' ? 'gaming' : '';
};
