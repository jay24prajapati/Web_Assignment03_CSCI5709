import express from 'express';
import { createRestaurant, getRestaurants, getRestaurantById } from '../controllers/';
import { authenticate } from '../utils';

const router = express.Router();

router.get('/', authenticate, getRestaurants);
router.post('/', authenticate, createRestaurant);
router.get('/:id', authenticate, getRestaurantById);

export default router;
