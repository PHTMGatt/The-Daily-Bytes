import { useEffect, useRef, useState } from 'react';
import { IMAGE_STALL_MS, getImageSlotState } from '../utils/articleImage';

interface ArticleImageProps {
  src?: string | null;
  alt?: string;
  fallbackLabel?: string;
  fallbackClassName?: string;
  /** Above-the-fold image (lead story): load eagerly at high priority. */
  priority?: boolean;
}

type LoadStatus = 'loading' | 'stalled' | 'loaded' | 'failed';

const ArticleImage = ({
  src,
  alt = '',
  fallbackLabel = 'DAILY BYTES',
  fallbackClassName = 'db-image-fallback',
  priority = false,
}: ArticleImageProps) => {
  const [status, setStatus] = useState<LoadStatus>('loading');
  const imgRef = useRef<HTMLImageElement>(null);
  const slot = getImageSlotState(src, status);

  useEffect(() => {
    setStatus('loading');
  }, [src]);

  // Cached images can finish before React attaches onLoad; pick that up on mount.
  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth > 0) setStatus('loaded');
  }, [src]);

  // A stalled download falls back once the image is actually near the screen, not while a
  // lazy image below the fold is still waiting for its turn.
  useEffect(() => {
    if (slot !== 'loading') return undefined;
    const img = imgRef.current;
    if (!img) return undefined;
    let timer: number | undefined;
    const startTimer = () => {
      if (timer === undefined) timer = window.setTimeout(() => setStatus((current) => (current === 'loading' ? 'stalled' : current)), IMAGE_STALL_MS);
    };
    if (priority || typeof IntersectionObserver === 'undefined') {
      startTimer();
      return () => window.clearTimeout(timer);
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        startTimer();
        observer.disconnect();
      }
    }, { rootMargin: '200px' });
    observer.observe(img);
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, [slot, src, priority]);

  if (slot === 'fallback') {
    return <div className={fallbackClassName}>{fallbackLabel}</div>;
  }

  return (
    <>
      {slot === 'loading' && <div className="db-image-skeleton" aria-hidden="true" />}
      {slot === 'stalled' && <div className={fallbackClassName}>{fallbackLabel}</div>}
      <img
        ref={imgRef}
        src={src || undefined}
        alt={alt}
        className={slot === 'ready' ? 'db-image-ready' : 'db-image-pending'}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        {...(priority ? { fetchpriority: 'high' } : {})}
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('failed')}
      />
    </>
  );
};

export default ArticleImage;
