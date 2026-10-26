export const shouldDisplayArticleImage = (src, failed = false) => {
  if (failed) return false;
  return typeof src === 'string' && src.trim().length > 0;
};
