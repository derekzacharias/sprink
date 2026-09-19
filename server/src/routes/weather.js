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
    return res.json(data || {});
  } catch (e) {
    // Be lenient in MVP: return empty object instead of 500 to avoid UI errors
    return res.json({});
  }
});

export default router;
