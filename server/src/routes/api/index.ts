import { Router } from 'express';
import authRoutes from '../auth-routes.js';
import horoscopeRoutes from './horoscope.js';
import mainNewsRoutes from './mainNews.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/horoscope', horoscopeRoutes);
router.use('/news', mainNewsRoutes);

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'daily-bytes' });
});

export default router;
