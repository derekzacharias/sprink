import { Router } from 'express';
import Zone from '../models/Zone.js';
import { requireAuth } from '../middleware/auth.js';
import { turnZoneOn, turnZoneOff } from '../services/zoneControl.js';

const router = Router();

router.use(requireAuth);

router.get('/', async (req, res) => {
  let zones = await Zone.find({ userId: req.user.id }).sort('zoneNumber');
  if (zones.length === 0) {
    const docs = Array.from({ length: 16 }, (_, i) => ({ userId: req.user.id, zoneNumber: i + 1 }));
    await Zone.insertMany(docs);
    zones = await Zone.find({ userId: req.user.id }).sort('zoneNumber');
  }
  res.json(zones);
});

router.post('/', async (req, res) => {
  const { zoneNumber, name, defaultDurationMin } = req.body;
  try {
    const zone = await Zone.create({ userId: req.user.id, zoneNumber, name, defaultDurationMin });
    res.status(201).json(zone);
  } catch (e) {
    res.status(400).json({ error: 'Failed to create zone' });
  }
});

router.put('/:id', async (req, res) => {
  const zone = await Zone.findOneAndUpdate({ _id: req.params.id, userId: req.user.id }, req.body, { new: true });
  if (!zone) return res.status(404).json({ error: 'Not found' });
  res.json(zone);
});

router.delete('/:id', async (req, res) => {
  const out = await Zone.deleteOne({ _id: req.params.id, userId: req.user.id });
  if (!out.deletedCount) return res.status(404).json({ error: 'Not found' });
  res.status(204).end();
});

// Control endpoints
router.post('/:zoneNumber/on', async (req, res) => {
  const { zoneNumber } = req.params;
  const durationMin = Number(req.body?.durationMin) || 10;
  try {
    await turnZoneOn(req.app, req.user.id, Number(zoneNumber), durationMin, 'manual');
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to turn on' });
  }
});

router.post('/:zoneNumber/off', async (req, res) => {
  const { zoneNumber } = req.params;
  try {
    await turnZoneOff(req.app, req.user.id, Number(zoneNumber), 'manual');
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to turn off' });
  }
});

export default router;
