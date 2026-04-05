const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
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
        validator(value) {
          return value > this.checkIn;
        },
        message: "Check-out date must be after check-in date",
      },
    },
    guests: { type: Number, required: true, min: 1, max: 10 },
    totalPrice: { type: Number, min: 0, default: 0 },
    status: {
      type: String,
      enum: ["pending", "confirmed", "checked-in", "cancelled", "completed"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "partially-paid", "paid", "refunded"],
      default: "unpaid",
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    cancelledAt: Date,
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

// Helper: calculate total price
async function calculateTotalPrice(booking) {
  const Listing = mongoose.model("Listing");
  const property = await Listing.findById(booking.property).lean();
  if (!property || !property.price)
    throw new Error("Listing or price not found");

  const nights = Math.ceil(
    (booking.checkOut - booking.checkIn) / (1000 * 60 * 60 * 24),
  );
  return nights * property.price;
}

// Pre-save hook
bookingSchema.pre("save", async function () {
  if (
    this.isModified("checkIn") ||
    this.isModified("checkOut") ||
    this.isModified("property")
  ) {
    this.totalPrice = await calculateTotalPrice(this);
  }
});

module.exports = mongoose.model("Booking", bookingSchema);
