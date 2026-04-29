const { body } = require("express-validator");

/* Listing */
exports.validateListing = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("price").isFloat({ min: 0 }).withMessage("Invalid price"),
  body("location.city").notEmpty().withMessage("City required"),
  body("location.country").notEmpty().withMessage("Country required"),
];

/* User */
exports.validateUser = [
  body("name").trim().notEmpty(),
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 6 }),
];

/* Booking */
exports.validateBooking = [
  body("property").isMongoId(),
  body("checkIn").isISO8601(),
  body("checkOut").isISO8601(),
  body("guests").isInt({ min: 1 }),
];
