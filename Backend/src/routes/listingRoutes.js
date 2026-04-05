const express = require("express");
const { validationResult } = require("express-validator");
const auth = require("../middleware/authMiddleware");
const listingController = require("../controllers/listingController");
const { validateListing } = require("../utils/validators");

const router = express.Router();

/* ----------------------------- Validation Handler ----------------------------- */
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Data validation failed",
      errors: errors.array(),
    });
  }
  next();
};

/* ----------------------------- Listing Routes ----------------------------- */

// General routes
router
  .route("/")
  .get(listingController.getAllListings)
  .post(
    auth,
    validateListing,
    handleValidation,
    listingController.createListing,
  );

// User-specific routes
router.route("/my-listings").get(auth, listingController.getMyListings);

// ID-specific routes
router
  .route("/:id")
  .get(listingController.getListingById)
  .put(auth, validateListing, handleValidation, listingController.updateListing)
  .delete(auth, listingController.deleteListing);

module.exports = router;
