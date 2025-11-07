import { Router } from 'express';
import { getWeatherSummary } from '../services/weather.js';
import { requireAuth } from '../middleware/auth.js';
import User from '../models/User.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).lean();
    const loc = user?.settings?.weather || {};
    const data = await getWeatherSummary(loc);
    res.json(data || {});
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch weather' });
  }
});

export default router;
