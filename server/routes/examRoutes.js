import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  generateExam,
  submitExam,
  getHistory,
  getSessionById,
} from '../controllers/examController.js';

const router = express.Router();

router.post('/generate', protect, generateExam);
router.post('/submit', protect, submitExam);
router.get('/history', protect, getHistory);
router.get('/history/:id', protect, getSessionById);

export default router;
