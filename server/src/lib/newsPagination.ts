export const getNewsWindow = (page: number, pageSize: number) => ({
  fetchLimit: Math.min(100, Math.max(1, pageSize)),
  offset: Math.max(0, page - 1) * Math.max(1, pageSize),
});
