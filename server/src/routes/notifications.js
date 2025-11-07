import { Router } from 'express';
import Notification from '../models/Notification.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const items = await Notification.find({ userId: req.user.id }).sort('-createdAt');
  res.json(items);
});

router.post('/', async (req, res) => {
  const item = await Notification.create({ ...req.body, userId: req.user.id });
  res.status(201).json(item);
});

router.post('/:id/read', async (req, res) => {
  const item = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { read: true },
    { new: true }
  );
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

export default router;

