import auth from '../utils/auth';

export interface SavedArticlePayload {
  title: string;
  url: string;
  description?: string;
  image?: string;
  source?: string;
  publishedAt?: string;
  topic?: string;
  savedAt?: string;
}

const request = async (url: string, options: RequestInit = {}) => {
  const token = auth.getToken();
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Saved articles request failed.');
  }

  return data;
};

export const getSavedArticles = async (): Promise<SavedArticlePayload[]> => {
  const data = await request('/api/saved');
  return Array.isArray(data?.articles) ? data.articles : [];
};

export const saveArticle = async (article: SavedArticlePayload) => {
  const data = await request('/api/saved', {
    method: 'POST',
    body: JSON.stringify(article),
  });
  return data?.article as SavedArticlePayload;
};

export const removeSavedArticle = async (url: string) => {
  await request(`/api/saved?url=${encodeURIComponent(url)}`, { method: 'DELETE' });
};
