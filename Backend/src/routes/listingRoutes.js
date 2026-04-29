const express = require("express");
const { validationResult } = require("express-validator");
const auth = require("../middleware/authMiddleware");
const listingController = require("../controllers/listingController");
const { validateListing } = require("../utils/validators");

const router = express.Router();

/* 🔹 Validation */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }
  next();
};

router
  .route("/")
  .get(listingController.getAllListings)
  .post(auth, validateListing, validate, listingController.createListing);

router.get("/my-listings", auth, listingController.getMyListings);

router
  .route("/:id")
  .get(listingController.getListingById)
  .put(auth, validateListing, validate, listingController.updateListing)
  .delete(auth, listingController.deleteListing);

module.exports = router;
