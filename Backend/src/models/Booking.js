const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    // who booked (customer)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // listing
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
      index: true,
    },

    // dates
    checkIn: { type: Date, required: true },
    checkOut: {
      type: Date,
      required: true,
      validate: {
        validator(val) {
          return this.checkIn && val > this.checkIn;
        },
        message: "Check-out must be after check-in",
      },
    },

    guests: {
      type: Number,
      required: true,
      min: 1,
    },

    // pricing
    pricePerNight: { type: Number, required: true },
    totalPrice: { type: Number, required: true },

    // lifecycle
    status: {
      type: String,
      enum: ["pending", "confirmed", "checked-in", "completed", "cancelled"],
      default: "pending",
      index: true,
    },

    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "refunded", "partially-paid"],
      default: "unpaid",
    },

    // audit (admin control)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    cancelledAt: Date,
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

/* ---------------- OVERLAP PREVENTION ---------------- */
bookingSchema.statics.isAvailable = async function (
  property,
  checkIn,
  checkOut,
) {
  const conflict = await this.findOne({
    property,
    status: { $ne: "cancelled" },

    // ✅ CORRECT overlap logic
    checkIn: { $lt: checkOut },
    checkOut: { $gt: checkIn },
  });

  return !conflict;
};

/* ---------------- PRICE CALC ---------------- */
bookingSchema.pre("validate", async function () {
  if (!this.isModified("checkIn") && !this.isModified("checkOut")) {
    return;
  }

  const Listing = mongoose.model("Listing");
  const listing = await Listing.findById(this.property).lean();

  if (!listing) {
    throw new Error("Listing not found");
  }

  const nights = Math.ceil(
    (this.checkOut - this.checkIn) / (1000 * 60 * 60 * 24),
  );

  if (nights <= 0) {
    throw new Error("Invalid booking duration");
  }

  this.pricePerNight = listing.price;
  this.totalPrice = nights * listing.price;
});

module.exports = mongoose.model("Booking", bookingSchema);
