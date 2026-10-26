const retrieveNews = async (
  category?: string,
  page: number = 1,
  pageSize: number = 12,
  keywords?: string
) => {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });

  if (keywords?.trim()) {
    params.set('keywords', keywords.trim());
  }

  const path = category ? `/api/news/${encodeURIComponent(category)}` : '/api/news';
  const response = await fetch(`${path}?${params.toString()}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.message || `Unable to load ${category || 'news'} right now.`);
  }

  return response.json();
};

export { retrieveNews };
