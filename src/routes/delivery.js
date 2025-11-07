import { Router } from 'express';
import { estimateDeliveryMinutes } from '../utils/deliveryTime.js';

const router = Router();

// GET /delivery-time?location=... OR ?pincode=... OR ?city=...
router.get('/', async (req, res, next) => {
  try {
    const { location, pincode, city } = req.query;

    const loc = (location || pincode || city || '').toString().trim();
    if (!loc) {
      return res.status(400).json({ error: 'Missing location (pincode or city)' });
    }

    const minutes = estimateDeliveryMinutes(loc);
    return res.json({ location: loc, etaMinutes: minutes, etaText: `${minutes}-${minutes + 15} mins` });
  } catch (err) {
    return next(err);
  }
});

export default router;



