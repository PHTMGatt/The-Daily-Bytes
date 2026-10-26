import { useEffect, useState } from 'react';
import { shouldDisplayArticleImage } from '../utils/articleImage';

interface ArticleImageProps {
  src?: string | null;
  alt?: string;
  fallbackLabel?: string;
  fallbackClassName?: string;
}

const ArticleImage = ({
  src,
  alt = '',
  fallbackLabel = 'DAILY BYTES',
  fallbackClassName = 'db-image-fallback',
}: ArticleImageProps) => {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!shouldDisplayArticleImage(src, failed)) {
    return <div className={fallbackClassName}>{fallbackLabel}</div>;
  }

  return (
    <img
      src={src || undefined}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
};

export default ArticleImage;
