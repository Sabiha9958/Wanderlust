const express = require("express");
const { validationResult } = require("express-validator");
const auth = require("../middleware/authMiddleware");
const bookingController = require("../controllers/bookingController");
const { validateBooking } = require("../utils/validators");

const router = express.Router();

// Create booking (with validation + auth)
router.post("/", auth, validateBooking, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ success: false, errors: errors.array() });
  bookingController.createBooking(req, res, next);
});

// Get all bookings
router.get("/", bookingController.getAllBookings);

// Get booking by ID
router.get("/:id", bookingController.getBookingById);

// Update booking (auth required)
router.put("/:id", auth, bookingController.updateBooking);

// Cancel booking (auth required)
router.patch("/:id/cancel", auth, bookingController.cancelBooking);

module.exports = router;
