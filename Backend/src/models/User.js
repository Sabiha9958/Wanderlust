const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9]{10}$/;

const userSchema = new mongoose.Schema(
  {
    avatar: {
      type: String,
      trim: true,
      validate: {
        validator: (v) =>
          !v || /^https?:\/\/.+/i.test(v) || /\.(jpg|jpeg|png|webp)$/i.test(v),
        message: "Invalid avatar URL or filename",
      },
    },

    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: EMAIL_REGEX,
    },

    phone: {
      type: String,
      trim: true,
      match: PHONE_REGEX,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },

    role: {
      type: String,
      enum: ["user", "staff", "admin"],
      default: "user",
    },

    isActive: { type: Boolean, default: true, index: true },
    isDeleted: { type: Boolean, default: false, index: true },

    deletedAt: Date,
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    lastLogin: Date,
    isEmailVerified: { type: Boolean, default: false },

    title: String,
    department: String,
    location: String,

    bio: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  { timestamps: true },
);

/* 🔐 Hash Password */
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

/* 🔑 Compare Password */
userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", userSchema);
