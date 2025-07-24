import { Request, Response } from "express";
import { Restaurant } from "../models/";
import type { AuthenticatedRequest, RestaurantQueryParams, CreateRestaurantBody } from "../types";

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
            lat,
            lng,
            radius = "10",
        } = req.query;

        const filter: any = { isActive: true };
        let query;
        let total;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const limitNum = parseInt(limit);

        if (lat && lng) {
            const latitude = parseFloat(lat);
            const longitude = parseFloat(lng);
            const radiusInKm = parseFloat(radius);

            if (isNaN(latitude) || isNaN(longitude) || isNaN(radiusInKm)) {
                res.status(400).json({ error: "Invalid coordinates or radius" });
                return;
            }

            // Aggregation pipeline for geospatial queries
            const pipeline: any[] = [
                {
                    $geoNear: {
                        near: {
                            type: "Point",
                            coordinates: [longitude, latitude]
                        },
                        distanceField: "distance",
                        maxDistance: radiusInKm * 1000,
                        spherical: true,
                        query: { isActive: true }
                    }
                }
            ];

            // Filters to pipeline
            if (cuisine) {
                pipeline.push({ $match: { cuisine: cuisine } });
            }
            if (priceRange) {
                pipeline.push({ $match: { priceRange: parseInt(priceRange) } });
            }

            // Get total count
            const countPipeline = [...pipeline, { $count: "total" }];
            const countResult = await Restaurant.aggregate(countPipeline);
            total = countResult[0]?.total || 0;

            // Pagination and lookup
            pipeline.push(
                { $sort: { distance: 1 } },
                { $skip: skip },
                { $limit: limitNum },
                {
                    $lookup: {
                        from: "users",
                        localField: "ownerId",
                        foreignField: "_id",
                        as: "ownerId",
                        pipeline: [{ $project: { name: 1, email: 1 } }]
                    }
                },
                { $unwind: { path: "$ownerId", preserveNullAndEmptyArrays: true } }
            );

            query = Restaurant.aggregate(pipeline);
        } else {
            // Optimize regular queries with proper indexing
            const findFilter = { ...filter };

            if (location) {
                // Text search for better performance
                findFilter.$text = { $search: location };
            }
            if (cuisine) {
                findFilter.cuisine = cuisine;
            }
            if (priceRange) {
                findFilter.priceRange = parseInt(priceRange);
            }

            // Use lean() for better performance and select only needed fields
            query = Restaurant.find(findFilter)
                .populate("ownerId", "name email")
                .select("-__v") 
                .lean()
                .sort(location ? { score: { $meta: "textScore" } } : { name: 1 })
                .skip(skip)
                .limit(limitNum);

            // Optimized count query
            total = await Restaurant.countDocuments(findFilter);
        }

        const restaurants = await query;

        res.json({
            restaurants,
            pagination: {
                page: parseInt(page),
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum),
            },
            filters: { location, cuisine, priceRange, lat, lng, radius },
        });
    } catch (error) {
        console.error("Restaurant search error:", error);
        res.status(500).json({ error: "Failed to fetch restaurants" });
    }
};

export const getRestaurantById = async (
    req: Request<{ id: string }>,
    res: Response
): Promise<void> => {
    try {
        // Use lean() and select only needed fields
        const restaurant = await Restaurant.findById(req.params.id)
            .populate("ownerId", "name email")
            .select("-__v")
            .lean();

        if (!restaurant) {
            res.status(404).json({ error: "Restaurant not found" });
            return;
        }

        if (!restaurant.isActive) {
            res.status(404).json({ error: "Restaurant is not available" });
            return;
        }

        // Set cache headers
        res.set('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes
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

export const createRestaurant = async (
    req: AuthenticatedRequest & Request<{}, {}, CreateRestaurantBody>,
    res: Response
): Promise<void> => {
    try {
        const restaurantData: any = {
            ...req.body,
            ownerId: req.user.id,
        };

        // Handle coordinates if provided
        if (req.body.coordinates) {
            restaurantData.coordinates = {
                type: 'Point',
                coordinates: [req.body.coordinates.longitude, req.body.coordinates.latitude]
            };
        }

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
