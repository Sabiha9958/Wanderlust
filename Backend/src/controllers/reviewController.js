const mongoose = require("mongoose");
const Review = require("../models/Review");
const Listing = require("../models/Listing");
const User = require("../models/User");
const { getIO } = require("../socket/socket");

/* ---------- HELPERS ---------- */

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const sendError = (res, status, message) => {
  return res.status(status).json({
    success: false,
    message,
  });
};

const sendSuccess = (res, status, data, extra = {}) => {
  return res.status(status).json({
    success: true,
    data,
    ...extra,
  });
};

/* ---------- CREATE REVIEW ---------- */

exports.createReview = async (req, res, next) => {
  try {
    const { listing, rating, comment } = req.body;
    const userId = req.user.id;

    if (!listing || !isValidId(listing)) {
      return sendError(res, 400, "Valid listing ID required");
    }

    if (!rating || rating < 1 || rating > 5) {
      return sendError(res, 400, "Rating must be between 1 and 5");
    }

    const listingExists = await Listing.exists({ _id: listing });
    if (!listingExists) {
      return sendError(res, 404, "Listing not found");
    }

    const alreadyReviewed = await Review.exists({
      listing,
      user: userId,
    });

    if (alreadyReviewed) {
      return sendError(res, 400, "You already reviewed this listing");
    }

    const user = await User.findById(userId).select("name").lean();

    const review = await Review.create({
      listing,
      user: userId,
      userName: user?.name || "Anonymous",
      rating,
      comment,
    });

    getIO()?.emit("dashboard:update", {
      type: "REVIEW_CREATED",
      data: review,
    });

    return sendSuccess(res, 201, review);
  } catch (err) {
    next(err);
  }
};

/* ---------- GET REVIEWS BY LISTING ---------- */

exports.getReviewsByListing = async (req, res, next) => {
  try {
    const { listingId } = req.params;

    if (!isValidId(listingId)) {
      return sendError(res, 400, "Invalid listing ID");
    }

    const reviews = await Review.find({ listing: listingId })
      .sort({ createdAt: -1 })
      .lean();

    return sendSuccess(res, 200, reviews, {
      count: reviews.length,
    });
  } catch (err) {
    next(err);
  }
};

/* ---------- GET SINGLE REVIEW ---------- */

exports.getReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return sendError(res, 400, "Invalid review ID");
    }

    const review = await Review.findById(id).lean();

    if (!review) {
      return sendError(res, 404, "Review not found");
    }

    return sendSuccess(res, 200, review);
  } catch (err) {
    next(err);
  }
};

/* ---------- UPDATE REVIEW ---------- */

exports.updateReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return sendError(res, 400, "Invalid review ID");
    }

    const review = await Review.findById(id);

    if (!review) {
      return sendError(res, 404, "Review not found");
    }

    if (review.user.toString() !== req.user.id) {
      return sendError(res, 403, "Not authorized to update this review");
    }

    const { rating, comment } = req.body;

    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;

    await review.save();

    return sendSuccess(res, 200, review);
  } catch (err) {
    next(err);
  }
};

/* ---------- DELETE REVIEW ---------- */

exports.deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return sendError(res, 400, "Invalid review ID");
    }

    const review = await Review.findById(id);

    if (!review) {
      return sendError(res, 404, "Review not found");
    }

    const isOwner = review.user.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return sendError(res, 403, "Not authorized to delete this review");
    }

    await review.deleteOne();

    return sendSuccess(res, 200, null, {
      message: "Review deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};
