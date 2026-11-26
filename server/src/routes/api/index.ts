import { Router } from 'express';
import { apiNotFound } from '../../lib/apiNotFound.js';
import authRoutes from '../auth-routes.js';
import horoscopeRoutes from './horoscope.js';
import mainNewsRoutes from './mainNews.js';
import savedArticlesRoutes from './savedArticles.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/horoscope', horoscopeRoutes);
router.use('/news', mainNewsRoutes);
router.use('/saved', savedArticlesRoutes);

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'daily-bytes' });
});

router.use(apiNotFound);

export default router;
