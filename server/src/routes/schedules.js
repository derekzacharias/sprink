import { Router } from 'express';
import Schedule from '../models/Schedule.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const items = await Schedule.find({ userId: req.user.id }).sort('-createdAt');
  res.json(items);
});

router.post('/', async (req, res) => {
  try {
    const item = await Schedule.create({ ...req.body, userId: req.user.id });
    res.status(201).json(item);
  } catch (e) {
    res.status(400).json({ error: 'Failed to create schedule' });
  }
});

router.put('/:id', async (req, res) => {
  const item = await Schedule.findOneAndUpdate({ _id: req.params.id, userId: req.user.id }, req.body, { new: true });
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

router.delete('/:id', async (req, res) => {
  const out = await Schedule.deleteOne({ _id: req.params.id, userId: req.user.id });
  if (!out.deletedCount) return res.status(404).json({ error: 'Not found' });
  res.status(204).end();
});

export default router;

