const express = require("express");
const { validationResult } = require("express-validator");
const auth = require("../middleware/authMiddleware");
const bookingController = require("../controllers/bookingController");
const { validateBooking } = require("../utils/validators");

const router = express.Router();

/* 🔹 Validation Middleware */
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

/* 🔹 Routes */
router
  .route("/")
  .post(auth, validateBooking, validate, bookingController.createBooking)
  .get(bookingController.getAllBookings);

router
  .route("/:id")
  .get(bookingController.getBookingById)
  .put(auth, bookingController.updateBooking);

/* 🔹 Payment Route (FIXED) */
router.patch("/:id/pay", auth, bookingController.updatePayment);

/* 🔹 Cancel Route */
router.patch("/:id/cancel", auth, bookingController.cancelBooking);

module.exports = router;
