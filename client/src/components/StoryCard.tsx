import { FiBookmark } from 'react-icons/fi';
import ArticleImage from './ArticleImage';
import { formatPublishedLabel } from '../utils/articleTime';
import { getArticleSource } from '../utils/articleSource.js';
import { getStoryLinkLabel } from '../utils/storyLinkLabel.js';
import { cleanSummary } from '../utils/storyText.js';
import { getArticleImage } from '../utils/articleImage';
import './StoryCard.css';

export interface StoryArticle {
  source?: string | { id?: string | null; name?: string };
  author?: string | null;
  title: string;
  description?: string | null;
  url: string;
  image?: string | null;
  urlToImage?: string | null;
  publishedAt?: string;
  published_at?: string;
}

export type StoryVariant = 'lead' | 'standard' | 'compact';

interface StoryCardProps {
  article: StoryArticle;
  variant?: StoryVariant;
  /** Matched game or topic ("GTA 6", "NVIDIA"). */
  tag?: string;
  saved?: boolean;
  saving?: boolean;
  onToggleSave?: (article: StoryArticle) => void;
  /** Rank numeral for ranked lists (Trending, Top right now). */
  rank?: number;
  /** Text-only row (the Top right now rail). */
  showImage?: boolean;
}

/**
 * One story, three sizes. The headline link is stretched over the whole card (one link, one tab
 * stop); the Save button sits above it so it stays its own 44px target.
 */
const StoryCard = ({
  article,
  variant = 'standard',
  tag,
  saved = false,
  saving = false,
  onToggleSave,
  rank,
  showImage = true,
}: StoryCardProps) => {
  const source = getArticleSource(article);
  const age = formatPublishedLabel(article.publishedAt || article.published_at);
  const summary = variant === 'compact' ? '' : cleanSummary(article.description);
  const Heading = variant === 'lead' ? 'h2' : 'h3';
  // Compact rows keep the tag inline with source and age, so a row stays one tight block.
  const inlineTag = variant === 'compact';

  const saveButton = onToggleSave && (
    <button
      type="button"
      className={`story-save${saved ? ' saved' : ''}`}
      disabled={saving}
      onClick={() => onToggleSave(article)}
      aria-pressed={saved}
      aria-label={`${saved ? 'Remove' : 'Save'} ${article.title}`}
      title={saved ? 'Saved' : 'Save'}
    >
      <FiBookmark aria-hidden="true" className={saved ? 'filled' : ''} />
    </button>
  );

  return (
    <article
      className={`story story-${variant}${rank !== undefined ? ' story-ranked' : ''}${showImage ? '' : ' story-text-only'}`}
    >
      {rank !== undefined && <span className="story-rank" aria-hidden="true">{rank}</span>}
      {showImage && (
        <div className="story-media">
          <ArticleImage
            src={getArticleImage(article)}
            fallbackLabel={source}
            fallbackClassName="story-image-fallback"
            priority={variant === 'lead'}
          />
        </div>
      )}
      <div className="story-body">
        {tag && !inlineTag && <span className="story-tag">{tag}</span>}
        <Heading className="story-title">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="story-link"
            aria-label={getStoryLinkLabel(article.title, source)}
          >
            {article.title}
          </a>
        </Heading>
        {summary && <p className="story-summary">{summary}</p>}
        <div className="story-meta">
          {tag && inlineTag && <span className="story-tag">{tag}</span>}
          <span>{source}</span>
          {age && <span aria-hidden="true">·</span>}
          {age && <span>{age}</span>}
        </div>
      </div>
      {saveButton}
    </article>
  );
};

export default StoryCard;
