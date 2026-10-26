const DEFAULT_GAMING_PROVIDER_KEYWORDS = [
  'gaming',
  'witcher',
  'cd projekt',
  'nvidia',
  'rtx',
  'gpu',
  'ram',
  'ddr5',
  'ssd',
  'pc hardware',
].join(',');

export const buildProviderKeywords = (keywords: string) => {
  const trimmed = keywords.trim();
  if (trimmed.toLowerCase() === 'gaming') return DEFAULT_GAMING_PROVIDER_KEYWORDS;
  return trimmed;
};
