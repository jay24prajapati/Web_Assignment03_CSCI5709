import { Request, Response } from "express";
import { Review, Restaurant } from "../models/";
import type { AuthenticatedRequest } from "../types/";

// Helper function to calculate and update average rating
const calculateAverageRating = async (restaurantId: string) => {
  try {
    const reviews = await Review.find({ restaurantId });
    const totalReviews = reviews.length;
    if (totalReviews === 0) {
      await Restaurant.findByIdAndUpdate(restaurantId, { _averageRating: 0 });
      return;
    }
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    const average = sum / totalReviews;
    await Restaurant.findByIdAndUpdate(restaurantId, { _averageRating: average });
  } catch (error) {
    console.error("Error calculating average rating:", error);
    throw new Error("Failed to update average rating");
  }
};

// Create a review (customer only)
export const createReview = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { restaurantId, rating, comment } = req.body;
    const customerId = req.user.id;

    // Input validation
    if (!restaurantId || !rating || !comment) {
      res.status(400).json({ error: "Restaurant ID, rating, and comment are required" });
      return;
    }
    if (rating < 1 || rating > 5) {
      res.status(400).json({ error: "Rating must be between 1 and 5" });
      return;
    }
    if (comment.trim() === "") {
      res.status(400).json({ error: "Comment cannot be empty" });
      return;
    }

    // Check if restaurant exists and is active
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant || !restaurant.isActive) {
      res.status(404).json({ error: "Restaurant not found or not active" });
      return;
    }

    // Check if customer has already reviewed this restaurant (handled by unique index)
    const existingReview = await Review.findOne({ customerId, restaurantId });
    if (existingReview) {
      res.status(400).json({ error: "You have already reviewed this restaurant" });
      return;
    }

    const review = new Review({
      customerId,
      restaurantId,
      rating,
      comment,
    });

    await review.save();

    // Update average rating
    await calculateAverageRating(restaurantId);

    res.status(201).json({
      message: "Review created successfully",
      review,
    });
  } catch (error) {
    console.error("Review creation error:", error);
    if (error instanceof Error && error.name === "MongoServerError" && (error as any).code === 11000) {
      res.status(400).json({ error: "You have already reviewed this restaurant" });
    } else {
      res.status(500).json({ error: "Failed to create review" });
    }
  }
};

// Update a review (customer only, for their own review)
export const updateReview = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const customerId = req.user.id;

    // Input validation
    if (rating && (rating < 1 || rating > 5)) {
      res.status(400).json({ error: "Rating must be between 1 and 5" });
      return;
    }
    if (comment && comment.trim() === "") {
      res.status(400).json({ error: "Comment cannot be empty" });
      return;
    }

    const review = await Review.findOne({ _id: id, customerId });

    if (!review) {
      res.status(404).json({ error: "Review not found or you don't have permission to update it" });
      return;
    }

    if (rating) review.rating = rating;
    if (comment) review.comment = comment;
    await review.save();

    // Update average rating
    await calculateAverageRating(review.restaurantId.toString());

    res.json({
      message: "Review updated successfully",
      review,
    });
  } catch (error) {
    console.error("Review update error:", error);
    res.status(500).json({ error: "Failed to update review" });
  }
};

// Delete a review (customer only, for their own review)
export const deleteReview = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const customerId = req.user.id;

    const review = await Review.findOneAndDelete({ _id: id, customerId });

    if (!review) {
      res.status(404).json({ error: "Review not found or you don't have permission to delete it" });
      return;
    }

    // Update average rating
    await calculateAverageRating(review.restaurantId.toString());

    res.json({
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Review deletion error:", error);
    res.status(500).json({ error: "Failed to delete review" });
  }
};

// Get all reviews for a restaurant (public)
export const getReviewsByRestaurant = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { restaurantId } = req.params;

    // Check if restaurant exists and is active
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant || !restaurant.isActive) {
      res.status(404).json({ error: "Restaurant not found or not active" });
      return;
    }

    const reviews = await Review.find({ restaurantId })
      .populate("customerId", "name")
      .sort({ createdAt: -1 });

    res.json({
      restaurantId,
      restaurantName: restaurant.name,
      reviews,
    });
  } catch (error) {
    console.error("Reviews fetch error:", error);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
};

// Reply to a review (owner only)
export const replyToReview = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { reply } = req.body;
    const ownerId = req.user.id;

    // Input validation
    if (!reply || reply.trim() === "") {
      res.status(400).json({ error: "Reply cannot be empty" });
      return;
    }

    const review = await Review.findById(id).populate("restaurantId");

    if (!review) {
      res.status(404).json({ error: "Review not found" });
      return;
    }

    const restaurant = review.restaurantId as any;
    if (restaurant.ownerId.toString() !== ownerId) {
      res.status(403).json({ error: "You don't have permission to reply to this review" });
      return;
    }

    review.ownerReply = reply;
    await review.save();

    res.json({
      message: "Reply added successfully",
      review,
    });
  } catch (error) {
    console.error("Review reply error:", error);
    res.status(500).json({ error: "Failed to add reply" });
  }
};