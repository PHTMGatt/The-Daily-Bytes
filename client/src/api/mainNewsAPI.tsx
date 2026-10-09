const retrieveNews = async (category?: string, page: number = 1, pageSize: number = 30) => {
  try {
    const url = category
      ? `/api/news/${category}?page=${page}&pageSize=${pageSize}`
      : `/api/news?page=${page}&pageSize=${pageSize}`;

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Invalid API response for ${category || 'main news'}`);
    }

    return await response.json();
  } catch (err) {
    console.log(`Error retrieving ${category || 'main'} news:`, err);
    return { articles: [], totalResults: 0 };
  }
};

export { retrieveNews };
