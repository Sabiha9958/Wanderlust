const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },

    checkIn: { type: Date, required: true },
    checkOut: {
      type: Date,
      required: true,
      validate: {
        validator(val) {
          return val > this.checkIn;
        },
        message: "Check-out must be after check-in",
      },
    },

    guests: { type: Number, required: true, min: 1 },

    pricePerNight: Number,
    totalPrice: Number,

    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "completed",
        "cancelled",
        "checked-in",
        "checked-out",
      ],
      default: "pending",
    },

    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "refunded", "partially-paid"],
      default: "unpaid",
    },

    cancelledAt: Date,
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

/* 🔍 Availability Check */
bookingSchema.statics.isAvailable = async function (
  property,
  checkIn,
  checkOut,
) {
  const exists = await this.exists({
    property,
    status: { $ne: "cancelled" },
    checkIn: { $lt: checkOut },
    checkOut: { $gt: checkIn },
  });

  return !exists;
};

/* 💰 Price Calculation */
bookingSchema.pre("save", async function () {
  if (!this.isModified("checkIn") && !this.isModified("checkOut")) return;

  const Listing = mongoose.model("Listing");
  const listing = await Listing.findById(this.property).lean();

  if (!listing) throw new Error("Listing not found");

  const nights = Math.ceil(
    (this.checkOut - this.checkIn) / (1000 * 60 * 60 * 24),
  );

  if (nights <= 0) throw new Error("Invalid booking duration");

  this.pricePerNight = listing.price;
  this.totalPrice = nights * listing.price;
});

module.exports = mongoose.model("Booking", bookingSchema);
