import type { Request, Response } from 'express';

// Unknown /api paths must not fall through to the SPA catch-all, which answers 200 with index.html
// and makes API clients parse HTML. Mounted last on the API router.
export const apiNotFound = (_req: Request, res: Response) => {
  res.status(404).json({ message: 'Not found.' });
};
