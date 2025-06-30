import express from 'express';
import { createRestaurant, getRestaurants, getRestaurantById } from '../controllers/restaurant';

const router = express.Router();

router.get('/', getRestaurants);
router.post('/', createRestaurant);
router.get('/:id', getRestaurantById);
