const MAX_FETCH_LIMIT = 100;
const BLOCK_PAGES = 4;

// Pages are served from provider "blocks" several pages wide so ranking and dedupe
// see a real candidate pool, and neighbouring pages share one provider request.
export const getNewsWindow = (page: number, pageSize: number) => {
  const size = Math.max(1, pageSize);
  const blockSize = Math.max(size, Math.floor(Math.min(MAX_FETCH_LIMIT, size * BLOCK_PAGES) / size) * size);
  const start = Math.max(0, page - 1) * size;
  const block = Math.floor(start / blockSize);

  return {
    fetchLimit: blockSize,
    offset: block * blockSize,
    block,
    sliceStart: start - block * blockSize,
  };
};
