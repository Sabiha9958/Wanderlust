const Listing = require("../models/Listing");
const Booking = require("../models/Booking");
const { calculateTotalPrice } = require("../utils/bookingUtils");

// Helper: standard error response
const handleError = (res, error, status = 500) => {
  res.status(status).json({ success: false, message: error.message || error });
};

// Create booking
exports.createBooking = async (req, res, next) => {
  try {
    const { listingId, checkInDate, checkOutDate, guests, userId } = req.body;

    const property = await Listing.findById(listingId);
    if (!property) {
      return res
        .status(404)
        .json({ success: false, message: "Listing not found" });
    }

    const totalPrice = calculateTotalPrice({
      price: property.price,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests,
    });

    const booking = await Booking.create({
      user: userId,
      property: listingId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests,
      totalPrice,
      createdBy: req.user?._id,
    });

    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    handleError(res, error);
  }
};

// Get all bookings
exports.getAllBookings = async (req, res, next) => {
  try {
    const filters = {};
    if (req.query.user) filters.user = req.query.user;
    if (req.query.status) filters.status = req.query.status;

    const bookings = await Booking.find(filters)
      .populate("user", "name email")
      .populate(
        "property",
        "title price location.area location.city location.state location.country",
      )
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    handleError(res, error);
  }
};

// Get booking by ID
exports.getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("user", "name email")
      .populate(
        "property",
        "title price location.area location.city location.state location.country",
      );

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }
    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    handleError(res, error);
  }
};

// Update booking
exports.updateBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // cleaner than returnDocument: "after"
      runValidators: true,
    })
      .populate("user", "name email")
      .populate(
        "property",
        "title price location.area location.city location.state location.country",
      );

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }
    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    handleError(res, error);
  }
};

// Cancel booking
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      {
        status: "cancelled",
        cancelledAt: new Date(),
        cancelledBy: req.user?._id,
      },
      { new: true, runValidators: true },
    )
      .populate("user", "name email")
      .populate(
        "property",
        "title price location.area location.city location.state location.country",
      );

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }
    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      data: booking,
    });
  } catch (error) {
    handleError(res, error);
  }
};
