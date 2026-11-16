export const MIN_JWT_SECRET_LENGTH = 32;

// Same value the existing tests sign with (tests/authSession.test.mjs); only used when NODE_ENV=test.
export const TEST_JWT_SECRET = 'daily-bytes-test-secret-that-is-long-enough';

/** Returns the JWT secret or throws, so a missing or weak secret stops boot instead of signing weak tokens. */
export const assertJwtSecret = (env: NodeJS.ProcessEnv = process.env): string => {
  let secret = env.JWT_SECRET_KEY;
  if (!secret && env.NODE_ENV === 'test') secret = TEST_JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET_KEY is required');
  if (secret.length < MIN_JWT_SECRET_LENGTH) {
    throw new Error(`JWT_SECRET_KEY must be at least ${MIN_JWT_SECRET_LENGTH} characters`);
  }
  return secret;
};
