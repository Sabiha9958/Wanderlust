const User = require("../models/User");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const { getIO } = require("../socket/socket");

/* 🔹 Helpers */
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, ...rest } = user;
  return rest;
};

/* 🔹 Get Me */
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).lean();

    if (!user || user.isDeleted) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, data: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
};

/* 🔹 Update Me */
exports.updateMe = async (req, res, next) => {
  try {
    const { role, isDeleted, password, ...updates } = req.body;

    const user = await User.findOneAndUpdate(
      { _id: req.user.id, isDeleted: false },
      updates,
      { new: true, runValidators: true },
    ).lean();

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, data: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
};

/* 🔹 Delete Me (Soft) */
exports.deleteMe = async (req, res, next) => {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.user.id, isDeleted: false },
      {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: req.user.id,
      },
      { new: true },
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, message: "Account deleted" });
  } catch (err) {
    next(err);
  }
};

/* 🔹 Create User (Admin) */
exports.createUser = async (req, res, next) => {
  try {
    const payload = { ...req.body };

    if (payload.password) {
      payload.password = await bcrypt.hash(payload.password, 10);
    }

    const user = await User.create(payload);

    getIO().emit("dashboard:update", {
      type: "USER_CREATED",
      data: user,
    });

    res.status(201).json({
      success: true,
      data: sanitizeUser(user.toObject()),
    });
  } catch (err) {
    next(err);
  }
};

/* 🔹 Get All */
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      count: users.length,
      data: users.map(sanitizeUser),
    });
  } catch (err) {
    next(err);
  }
};

/* 🔹 Get One */
exports.getUserById = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const user = await User.findById(req.params.id).lean();

    if (!user || user.isDeleted) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, data: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
};

/* 🔹 Update User (Admin) */
exports.updateUser = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const updates = { ...req.body };

    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const user = await User.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      updates,
      { new: true, runValidators: true },
    ).lean();

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, data: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
};

/* 🔹 Delete User */
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const hard = req.query.hard === "true";

    if (!isValidId(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    let user;

    if (hard) {
      user = await User.findByIdAndDelete(id);
    } else {
      user = await User.findOneAndUpdate(
        { _id: id, isDeleted: false },
        {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: req.user.id,
        },
        { new: true },
      );
    }

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      message: hard ? "User permanently deleted" : "User soft deleted",
    });
  } catch (err) {
    next(err);
  }
};
