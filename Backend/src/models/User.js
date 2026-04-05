const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9]{10}$/;
const ROLES = ["user", "staff", "admin"];

const userSchema = new mongoose.Schema(
  {
    avatar: {
      type: String,
      trim: true,
      validate: {
        validator: (value) => {
          if (!value) return true;
          const filePattern = /^.*\.(jpg|jpeg|png|webp)$/i;
          const urlPattern = /^https?:\/\/.+/i;
          return filePattern.test(value) || urlPattern.test(value);
        },
        message: "Avatar must be a valid image filename or URL",
      },
    },
    name: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 100,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [EMAIL_REGEX, "Invalid email format"],
    },
    phone: {
      type: String,
      trim: true,
      match: [PHONE_REGEX, "Phone must be exactly 10 digits"],
    },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ROLES, default: "user" },
    isActive: { type: Boolean, default: true, index: true },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: Date,
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    lastLogin: Date,
    isEmailVerified: { type: Boolean, default: false },
    title: { type: String, trim: true },
    department: { type: String, trim: true },
    location: { type: String, trim: true },
    bio: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true },
);

// Middleware: hash password
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const bcryptHashRegex = /^\$2[aby]\$.{56}$/;
  if (!bcryptHashRegex.test(this.password)) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

// Instance method: compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
