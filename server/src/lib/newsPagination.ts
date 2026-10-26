export const getNewsWindow = (page: number, pageSize: number) => ({
  fetchLimit: Math.min(100, pageSize * 2),
  offset: Math.max(0, page - 1) * pageSize,
});
