export const buildDemoAuthRequest = () => ({
  path: '/api/auth/demo',
  init: {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  },
});
