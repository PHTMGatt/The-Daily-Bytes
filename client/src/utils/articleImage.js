export const shouldDisplayArticleImage = (src, failed = false) => {
  if (failed) return false;
  return typeof src === 'string' && src.trim().length > 0;
};

// A publisher image that has not arrived after this long is treated as failed, so a stalled or
// very large download shows the branded fallback instead of an empty frame forever.
export const IMAGE_STALL_MS = 12000;

// What the image slot shows: the branded fallback, a loading skeleton, or the loaded picture.
export const getImageSlotState = (src, status = 'loading') => {
  if (!shouldDisplayArticleImage(src, status === 'failed')) return 'fallback';
  return status === 'loaded' ? 'ready' : 'loading';
};
