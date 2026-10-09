import { Router } from 'express';
import horoscopeRoutes from './horoscope.js';
import mainNewsRoutes from './mainNews.js';

const router = Router();

router.use('/horoscope', horoscopeRoutes);
router.use('/news', mainNewsRoutes);

export default router;
