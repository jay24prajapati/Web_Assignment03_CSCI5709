import express from 'express';
import { createRestaurant, getRestaurants, getRestaurantById } from '../controllers/';
import { authenticate } from '../utils';

const router = express.Router();

// Public routes - no authentication needed for browsing
router.get('/', getRestaurants as any);
router.get('/:id', getRestaurantById as any);

// Protected routes - authentication required for creating restaurants
router.post('/', authenticate as any, createRestaurant as any);

export default router;
