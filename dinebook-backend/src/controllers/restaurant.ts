import { Request, Response } from "express";
import { Restaurant } from "../models/";

import type { AuthenticatedRequest, RestaurantQueryParams, CreateRestaurantBody } from "../types/restaurant";

/**
 * Get all restaurants with optional filtering and pagination
 */
export const getRestaurants = async (
    req: Request<{}, {}, {}, RestaurantQueryParams>,
    res: Response
): Promise<void> => {
    try {
        const {
            location,
            cuisine,
            priceRange,
            page = "1",
            limit = "10",
        } = req.query;
        const filter: any = { isActive: true };

        if (location) {
            filter.location = { $regex: location, $options: "i" };
        }

        if (cuisine) {
            filter.cuisine = cuisine;
        }

        if (priceRange) {
            filter.priceRange = parseInt(priceRange);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const restaurants = await Restaurant.find(filter)
            .populate("ownerId", "name email")
            .sort({ name: 1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Restaurant.countDocuments(filter);

        res.json({
            restaurants,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit)),
            },
            filters: { location, cuisine, priceRange },
        });
    } catch (error) {
        console.error("Restaurant search error:", error);
        res.status(500).json({ error: "Failed to fetch restaurants" });
    }
};

/**
 * Get a single restaurant by ID
 */
export const getRestaurantById = async (
    req: Request<{ id: string }>,
    res: Response
): Promise<void> => {
    try {
        const restaurant = await Restaurant.findById(req.params.id).populate(
            "ownerId",
            "name email"
        );

        if (!restaurant) {
            res.status(404).json({ error: "Restaurant not found" });
            return;
        }

        if (!restaurant.isActive) {
            res.status(404).json({ error: "Restaurant is not available" });
            return;
        }

        res.json(restaurant);
    } catch (error) {
        console.error("Restaurant fetch error:", error);

        if (error instanceof Error && error.name === "CastError") {
            res.status(400).json({ error: "Invalid restaurant ID" });
            return;
        }

        res.status(500).json({ error: "Failed to fetch restaurant" });
    }
};

/**
 * Create a new restaurant
 */
export const createRestaurant = async (
    req: Request<{}, {}, CreateRestaurantBody>,
    res: Response
): Promise<void> => {
    try {
        const restaurantData = {
            ...req.body,
            // ownerId: req.user._id, TODO: fetch user ID from authenticated request
        };

        const restaurant = new Restaurant(restaurantData);
        await restaurant.save();

        await restaurant.populate("ownerId", "name email");

        res.status(201).json({
            message: "Restaurant created successfully",
            restaurant,
        });
    } catch (error) {
        console.error("Restaurant creation error:", error);
        res.status(500).json({ error: "Failed to create restaurant" });
    }
};
