const User = require("../models/User");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

/* ---------- Helpers ---------- */

// Remove sensitive information before sending to client
const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, ...rest } = user;
  return rest;
};

// Validate Mongo ID
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

/* ---------- User Controllers (Self-Management) ---------- */

// GET /api/users/me
exports.getMe = async (req, res, next) => {
  try {
    if (!isValidId(req.user.id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user ID" });
    }

    const user = await User.findById(req.user.id).lean();

    if (!user || user.isDeleted) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      data: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/users/me
exports.updateMe = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Prevent users from escalating their own privileges
    const { role, isDeleted, password, ...allowedUpdates } = req.body;

    const user = await User.findOneAndUpdate(
      { _id: userId, isDeleted: false },
      allowedUpdates,
      { returnDocument: "after", runValidators: true },
    ).lean();

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      data: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/users/me
exports.deleteMe = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await User.findOneAndUpdate(
      { _id: userId, isDeleted: false },
      {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: userId,
      },
      { returnDocument: "after" },
    ).lean();

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Your account has been deleted.",
    });
  } catch (error) {
    next(error);
  }
};

/* ---------- Admin Controllers ---------- */

// POST /api/users (admin)
exports.createUser = async (req, res, next) => {
  try {
    const payload = { ...req.body };

    if (payload.password) {
      payload.password = await bcrypt.hash(payload.password, 10);
    }

    const user = await User.create(payload);

    res.status(201).json({
      success: true,
      data: sanitizeUser(user.toObject()),
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/users
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: users.map(sanitizeUser),
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/users/:id
exports.getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid ID format" });
    }

    const user = await User.findById(id).lean();

    if (!user || user.isDeleted) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      data: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/users/:id (admin)
exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid ID format" });
    }

    const updates = { ...req.body };

    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const user = await User.findOneAndUpdate(
      { _id: id, isDeleted: false },
      updates,
      { returnDocument: "after", runValidators: true },
    ).lean();

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      data: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/users/:id (admin)
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const hardDelete = req.query.hard === "true";

    if (!isValidId(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid ID format" });
    }

    let user;

    if (hardDelete) {
      user = await User.findByIdAndDelete(id).lean();
    } else {
      user = await User.findOneAndUpdate(
        { _id: id, isDeleted: false },
        {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: req.user?.id,
        },
        { returnDocument: "after" },
      ).lean();
    }

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: hardDelete
        ? "User permanently deleted"
        : "User soft deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
