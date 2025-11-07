import { Router } from 'express';
import Order from '../models/Order.js';

const router = Router();

// POST /order -> receive an order
// Body: { foodName: string, userLocation: { pincode?: string, city?: string, address?: string }, totalAmount: number }
router.post('/', async (req, res, next) => {
  try {
    const { foodName, userLocation, totalAmount } = req.body || {};

    if (!foodName || typeof foodName !== 'string') {
      return res.status(400).json({ error: 'Invalid or missing foodName' });
    }
    if (typeof totalAmount !== 'number' || Number.isNaN(totalAmount) || totalAmount < 0) {
      return res.status(400).json({ error: 'Invalid totalAmount' });
    }

    const safeLocation = {
      pincode: userLocation?.pincode || '',
      city: userLocation?.city || '',
      address: userLocation?.address || ''
    };

    const order = await Order.create({ foodName, userLocation: safeLocation, totalAmount });
    return res.status(201).json({ order });
  } catch (err) {
    return next(err);
  }
});

export default router;



