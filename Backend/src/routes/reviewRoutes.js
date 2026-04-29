const express = require("express");
const auth = require("../middleware/authMiddleware");
const reviewController = require("../controllers/reviewController");

const router = express.Router();

router.post("/", auth, reviewController.createReview);
router.get("/listing/:listingId", reviewController.getReviewsByListing);
router.get("/:id", reviewController.getReview);
router.put("/:id", auth, reviewController.updateReview);
router.delete("/:id", auth, reviewController.deleteReview);

module.exports = router;
