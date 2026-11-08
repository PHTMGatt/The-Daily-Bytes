const DEFAULT_GAMING_PROVIDER_KEYWORDS = [
  'gaming',
  'video games',
  'witcher',
  'cd projekt',
  'nvidia',
  'geforce',
  'rtx',
  'gpu',
  'amd',
  'radeon',
  'ram',
  'ddr5',
  'ssd',
  'pc hardware',
  'xbox',
  'playstation',
  'nintendo',
  'steam',
].join(',');

// "my games": one feed covering every game in Bryen's "My games" row.
const MY_GAMES_PROVIDER_KEYWORDS = [
  'witcher',
  'assassins creed',
  'crimson desert',
  'cyberpunk',
  'elden ring',
  'apex legends',
  'call of duty',
  'black ops',
  'hitman',
  'batman arkham',
  'far cry',
  'gta 6',
  'ark survival',
  'rocket league',
  'counter-strike',
  'doom',
].join(',');

// "my gear": one feed covering every part and brand in Bryen's "My gear" row on the tech hub.
const MY_GEAR_PROVIDER_KEYWORDS = [
  'rtx 5090',
  'rtx 5080',
  'nvidia',
  '9950x3d',
  'ryzen',
  'corsair',
  'dominator',
  'ddr5',
  'samsung ssd',
  'razer',
  'asus rog',
  'oled monitor',
  'ekwb',
  'raspberry pi',
  'elgato',
  'logitech',
].join(',');

export const buildProviderKeywords = (keywords: string) => {
  const trimmed = keywords.trim();
  const lower = trimmed.toLowerCase();
  if (lower === 'gaming') return DEFAULT_GAMING_PROVIDER_KEYWORDS;
  if (lower === 'my games') return MY_GAMES_PROVIDER_KEYWORDS;
  if (lower === 'my gear') return MY_GEAR_PROVIDER_KEYWORDS;
  return trimmed;
};
