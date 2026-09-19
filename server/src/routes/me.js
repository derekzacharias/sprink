import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import User from '../models/User.js';

const router = Router();
router.use(requireAuth);

router.get('/settings', async (req, res) => {
  const user = await User.findById(req.user.id).lean();
  res.json(user?.settings || {});
});

router.put('/settings', async (req, res) => {
  const { weather, smartMode } = req.body || {};
  const set = {};
  if (weather !== undefined) set['settings.weather'] = weather || {};
  if (smartMode !== undefined) set['settings.smartMode'] = !!smartMode;
  const user = await User.findByIdAndUpdate(req.user.id, { $set: set }, { new: true }).lean();
  res.json(user?.settings || {});
});

export default router;
