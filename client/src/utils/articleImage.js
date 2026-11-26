export const shouldDisplayArticleImage = (src, failed = false) => {
  if (failed) return false;
  return typeof src === 'string' && src.trim().length > 0;
};

// A visible publisher image that has not arrived after this long shows the branded fallback, but the
// download keeps going underneath so a late image still fades in. Only a load error is final.
export const IMAGE_STALL_MS = 6000;

// What the image slot shows: 'fallback' (no image or it errored), 'loading' (skeleton),
// 'stalled' (fallback over a still-downloading image) or 'ready' (the picture).
export const getImageSlotState = (src, status = 'loading') => {
  if (!shouldDisplayArticleImage(src, status === 'failed')) return 'fallback';
  if (status === 'loaded') return 'ready';
  return status === 'stalled' ? 'stalled' : 'loading';
};
