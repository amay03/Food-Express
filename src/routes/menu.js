import { Router } from 'express';
import MenuItem from '../models/MenuItem.js';

const router = Router();

// GET /menu -> fetch all food items
router.get('/', async (req, res, next) => {
  try {
    const items = await MenuItem.find({}).sort({ createdAt: -1 }).lean();
    return res.json({ items });
  } catch (err) {
    return next(err);
  }
});

export default router;



