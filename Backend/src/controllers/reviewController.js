const mongoose = require("mongoose");
const Review = require("../models/Review");
const Listing = require("../models/Listing");
const User = require("../models/User");
const { getIO } = require("../socket/socket");

// Create review
exports.createReview = async (req, res, next) => {
  try {
    const { listingId, rating, comment } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!mongoose.Types.ObjectId.isValid(listingId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid listing ID" });
    }

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res
        .status(404)
        .json({ success: false, message: "Listing not found" });
    }

    const existingReview = await Review.findOne({ listingId, userId });
    if (existingReview) {
      return res
        .status(400)
        .json({ success: false, message: "You already reviewed this listing" });
    }

    const user = await User.findById(userId).select("name");

    const review = await Review.create({
      listingId,
      userId,
      userName: user?.name || "Anonymous",
      rating,
      comment,
    });

    const io = getIO();
    io.emit("dashboard:update", {
      type: "REVIEW_CREATED",
      data: review,
    });

    return res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: review,
    });
  } catch (error) {
    console.error("Review creation error:", error.message);
    next(error);
  }
};

// Get reviews by listing
exports.getReviewsByListing = async (req, res, next) => {
  try {
    const { listingId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(listingId))
      return res
        .status(400)
        .json({ success: false, message: "Invalid listing ID" });

    const reviews = await Review.find({ listingId }).sort({ createdAt: -1 });
    res
      .status(200)
      .json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    next(error);
  }
};

// Get single review
exports.getReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid review ID" });
    }

    const review = await Review.findById(id);
    if (!review)
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });

    res.status(200).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

// Update review
exports.updateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid review ID" });
    }

    const review = await Review.findById(id);
    if (!review)
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });

    if (review.userId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    review.rating = req.body.rating ?? review.rating;
    review.comment = req.body.comment ?? review.comment;
    await review.save();

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

// Delete review
exports.deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid review ID" });
    }

    const review = await Review.findById(id);
    if (!review)
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });

    if (review.userId.toString() !== req.user.id && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    await review.deleteOne();
    res
      .status(200)
      .json({ success: true, message: "Review deleted successfully" });
  } catch (error) {
    next(error);
  }
};
