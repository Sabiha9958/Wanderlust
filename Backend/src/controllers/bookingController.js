const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Listing = require("../models/Listing");
const { getIO } = require("../socket/socket");

exports.createBooking = async (req, res, next) => {
  try {
    const { property, checkIn, checkOut, guests } = req.body;

    if (!mongoose.Types.ObjectId.isValid(property)) {
      return res.status(400).json({
        success: false,
        message: "Invalid property ID",
      });
    }

    const listing = await Listing.findById(property);
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    const start = new Date(checkIn);
    const end = new Date(checkOut);

    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: "Invalid date range",
      });
    }

    const isAvailable = await Booking.isAvailable(property, start, end);

    if (!isAvailable) {
      return res.status(409).json({
        success: false,
        message: "Dates not available",
      });
    }

    const booking = await Booking.create({
      user: req.user.id,
      property,
      checkIn: start,
      checkOut: end,
      guests,
      createdBy: req.user.id,
    });

    getIO().emit("dashboard:update", {
      type: "BOOKING_CREATED",
      data: booking,
    });

    res.status(201).json({
      success: true,
      data: booking,
    });
  } catch (err) {
    next(err);
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
        cancelledBy: req.user?.id,
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
