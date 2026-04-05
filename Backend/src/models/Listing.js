const mongoose = require("mongoose");
const { Schema } = mongoose;

/* ----------------------------- Counter Schema ----------------------------- */
const counterSchema = new Schema(
  {
    _id: { type: String, required: true, trim: true },
    seq: { type: Number, default: 0, min: 0 },
  },
  { versionKey: false },
);

const Counter =
  mongoose.models.Counter || mongoose.model("Counter", counterSchema);

/* ------------------------------ Helper Utils ------------------------------ */
const slugify = (text = "") =>
  text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const imageUrlValidator = (url) => /^https?:\/\/.+/i.test(url);

/* ------------------------------ Image Schema ------------------------------ */
const imageSchema = new Schema(
  {
    filename: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    url: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: imageUrlValidator,
        message: "Image URL must be a valid http/https URL",
      },
    },
    caption: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "",
    },
    isCover: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false },
);

/* ---------------------------- Location Schema ----------------------------- */
const locationSchema = new Schema(
  {
    city: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    area: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "",
    },
    state: {
      type: String,
      trim: true,
      maxlength: 80,
      default: "",
    },
    country: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    addressLine: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },
    pincode: {
      type: String,
      trim: true,
      maxlength: 20,
      default: "",
    },
  },
  { _id: false },
);

/* ----------------------------- Listing Schema ----------------------------- */
const listingSchema = new Schema(
  {
    listingId: {
      type: Number,
      unique: true,
      index: true,
    },

    slug: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 120,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    propertyType: {
      type: String,
      enum: [
        "studio",
        "apartment",
        "house",
        "villa",
        "guest-house",
        "homestay",
        "loft",
        "cottage",
        "bungalow",
        "resort",
        "penthouse",
        "other",
      ],
      default: "apartment",
    },

    category: {
      type: String,
      enum: ["budget", "standard", "premium", "luxury"],
      default: "standard",
    },

    images: {
      type: [imageSchema],
      required: true,
      default: [],
      validate: [
        {
          validator: (arr) => Array.isArray(arr) && arr.length >= 2,
          message: "At least 2 images are required",
        },
        {
          validator: (arr) => Array.isArray(arr) && arr.length <= 15,
          message: "Maximum 15 images allowed",
        },
      ],
    },

    price: {
      type: Number,
      required: true,
      min: 100,
      max: 1000000,
    },

    currency: {
      type: String,
      trim: true,
      uppercase: true,
      default: "INR",
      enum: ["INR", "USD", "EUR", "GBP"],
    },

    cleaningFee: {
      type: Number,
      min: 0,
      default: 0,
    },

    serviceFee: {
      type: Number,
      min: 0,
      default: 0,
    },

    location: {
      type: locationSchema,
      required: true,
    },

    bedrooms: {
      type: Number,
      min: 1,
      max: 20,
      default: 1,
    },

    bathrooms: {
      type: Number,
      min: 1,
      max: 15,
      default: 1,
    },

    beds: {
      type: Number,
      min: 1,
      max: 30,
      default: 1,
    },

    maxGuests: {
      type: Number,
      required: true,
      min: 1,
      max: 20,
    },

    amenities: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 50,
        message: "Maximum 50 amenities allowed",
      },
      set: (arr) => [
        ...new Set(
          arr.map((item) => item.trim().toLowerCase()).filter(Boolean),
        ),
      ],
    },

    host: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    hostName: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "",
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      set: (val) => Number(val.toFixed(1)),
    },

    reviews: {
      type: Number,
      default: 0,
      min: 0,
    },

    postDate: {
      type: Date,
      default: Date.now,
    },

    isAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },

    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

/* -------------------------------- Virtuals -------------------------------- */
listingSchema.virtual("coverImage").get(function () {
  if (!Array.isArray(this.images) || this.images.length === 0) {
    return null;
  }

  const cover = this.images.find((img) => img.isCover);
  return cover || this.images[0] || null;
});

listingSchema.virtual("totalPrice").get(function () {
  return this.price + this.cleaningFee + this.serviceFee;
});

listingSchema.virtual("fullLocation").get(function () {
  return [
    this.location?.area,
    this.location?.city,
    this.location?.state,
    this.location?.country,
  ]
    .filter(Boolean)
    .join(", ");
});

/* ------------------------------- Middleware ------------------------------- */
listingSchema.pre("validate", function () {
  if (!Array.isArray(this.images)) {
    this.images = [];
  }

  if (this.images.length > 0) {
    const hasCover = this.images.some((img) => img.isCover);
    if (!hasCover) this.images[0].isCover = true;
  }
});

listingSchema.pre("save", async function () {
  if (this.isNew && !this.listingId) {
    const counter = await Counter.findByIdAndUpdate(
      "listingId",
      { $inc: { seq: 1 } },
      { returnDocument: "after", upsert: true },
    );
    this.listingId = counter.seq;
  }

  if (this.host && !this.hostName) {
    const User = mongoose.models.User || mongoose.model("User");
    const hostUser = await User.findById(this.host).select("name");
    if (hostUser?.name) {
      this.hostName = hostUser.name;
    }
  }

  if (this.isModified("title")) {
    this.slug = `${slugify(this.title)}-${this.listingId || "draft"}`;
  }
});

/* --------------------------------- Indexes -------------------------------- */
listingSchema.index({
  title: "text",
  description: "text",
  "location.city": "text",
  "location.area": "text",
  "location.state": "text",
  "location.country": "text",
  amenities: "text",
});

listingSchema.index({ price: 1 });
listingSchema.index({ rating: -1, reviews: -1 });
listingSchema.index({ featured: -1, isAvailable: 1 });
listingSchema.index({ propertyType: 1, category: 1 });
listingSchema.index({ createdAt: -1 });

module.exports =
  mongoose.models.Listing || mongoose.model("Listing", listingSchema);
