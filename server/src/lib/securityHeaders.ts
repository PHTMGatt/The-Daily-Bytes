import type { NextFunction, Request, Response } from 'express';

// Headers that are safe for every response. The CSP restricts scripts to same-origin (the Vite
// build emits only external module scripts, no inline ones), plus framing, plugins, <base> and
// form targets. Article images come from arbitrary publisher hosts, so img-src stays open.
const BASE_HEADERS: Record<string, string> = {
  'Content-Security-Policy': "script-src 'self'; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
};

const HSTS = 'max-age=15552000; includeSubDomains';

// API responses carry per-user data (saved articles, sessions); keep them out of shared caches.
const API_CACHE_CONTROL = 'no-store';

export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  for (const [name, value] of Object.entries(BASE_HEADERS)) {
    res.setHeader(name, value);
  }
  if (req.secure) {
    res.setHeader('Strict-Transport-Security', HSTS);
  }
  if (req.path === '/api' || req.path.startsWith('/api/')) {
    res.setHeader('Cache-Control', API_CACHE_CONTROL);
  }
  next();
};
