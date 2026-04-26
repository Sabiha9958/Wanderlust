const { body } = require("express-validator");

/**
 * ✅ Listing validation rules
 */
exports.validateListing = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
  body("location.city").trim().notEmpty().withMessage("City is required"),
  body("location.country").trim().notEmpty().withMessage("Country is required"),
];

/**
 * ✅ User validation rules
 */
exports.validateUser = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

/**
 * ✅ Booking validation rules
 */
exports.validateBooking = [
  body("property").isMongoId().withMessage("Invalid property ID"),

  body("checkIn").isISO8601().toDate().withMessage("Invalid check-in date"),

  body("checkOut").isISO8601().toDate().withMessage("Invalid check-out date"),

  body("guests").isInt({ min: 1 }).withMessage("Guests must be at least 1"),
];
