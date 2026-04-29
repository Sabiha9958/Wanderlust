const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Listing = require("../models/Listing");
const { getIO } = require("../socket/socket");

/* 🔹 Common populate config */
const bookingPopulate = [
  { path: "user", select: "name email" },
  { path: "property", select: "title price location" },
];

/* 🔹 Create Booking */
exports.createBooking = async (req, res, next) => {
  try {
    const { property, checkIn, checkOut, guests } = req.body;

    if (!mongoose.Types.ObjectId.isValid(property)) {
      return res.status(400).json({
        success: false,
        message: "Invalid property ID",
      });
    }

    const listing = await Listing.findById(property).lean();
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

    const available = await Booking.isAvailable(property, start, end);
    if (!available) {
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

/* 🔹 Get All */
exports.getAllBookings = async (req, res, next) => {
  try {
    const filters = {};

    if (req.query.user) filters.user = req.query.user;
    if (req.query.status) filters.status = req.query.status;

    const bookings = await Booking.find(filters)
      .populate(bookingPopulate)
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (err) {
    next(err);
  }
};

/* 🔹 Get One */
exports.getBookingById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    const booking = await Booking.findById(req.params.id)
      .populate(bookingPopulate)
      .lean();

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.json({
      success: true,
      data: booking,
    });
  } catch (err) {
    next(err);
  }
};

/* 🔹 Update Booking */
exports.updateBooking = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate(bookingPopulate)
      .lean();

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.json({
      success: true,
      data: booking,
    });
  } catch (err) {
    next(err);
  }
};

/* 🔹 Payment Update */
exports.updatePayment = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.paymentStatus === "paid") {
      return res.status(400).json({
        success: false,
        message: "Booking already paid",
      });
    }

    booking.paymentStatus = "paid";
    booking.status = "confirmed";

    await booking.save();

    const populated = await booking.populate(bookingPopulate);

    res.json({
      success: true,
      message: "Payment successful",
      data: populated,
    });
  } catch (err) {
    next(err);
  }
};

/* 🔹 Cancel Booking */
exports.cancelBooking = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      {
        status: "cancelled",
        cancelledAt: new Date(),
        cancelledBy: req.user?.id,
      },
      { new: true, runValidators: true },
    )
      .populate(bookingPopulate)
      .lean();

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.json({
      success: true,
      message: "Booking cancelled successfully",
      data: booking,
    });
  } catch (err) {
    next(err);
  }
};
