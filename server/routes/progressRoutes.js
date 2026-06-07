import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getDashboard,
  getStreak,
  getFullProgress,
} from '../controllers/progressController.js';

const router = express.Router();

router.get('/dashboard', protect, getDashboard);
router.get('/streak', protect, getStreak);
router.get('/full', protect, getFullProgress);

export default router;
