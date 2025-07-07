import express from 'express';
import {
  createReview,
  updateReview,
  deleteReview,
  getReviewsByRestaurant,
  replyToReview,
} from '../controllers/review';
import { authenticate } from '../utils';

const router = express.Router();

// Customer routes (authenticated)
router.post('/', authenticate as any, createReview as any);
router.put('/:id', authenticate as any, updateReview as any);
router.delete('/:id', authenticate as any, deleteReview as any);

// Public route
router.get('/restaurant/:restaurantId', getReviewsByRestaurant as any);

// Owner route (authenticated)
router.post('/:id/reply', authenticate as any, replyToReview as any);

export default router;