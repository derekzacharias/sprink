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
  const { weather } = req.body || {};
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { $set: { 'settings.weather': weather || {} } },
    { new: true }
  ).lean();
  res.json(user?.settings || {});
});

export default router;

