const User = require("../models/User");
const jwt = require("jsonwebtoken");

/* 🔹 Generate JWT */
const generateToken = (user, expires = "14d") =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: expires,
  });

/* 🔹 Common response formatter */
const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});

/* ---------------- REGISTER ---------------- */
exports.registerUser = async (req, res, next) => {
  try {
    let { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    email = email.toLowerCase().trim();

    const exists = await User.exists({ email });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // ❗ DO NOT hash here (model already does it)
    const user = await User.create({
      name: name.trim(),
      email,
      password,
      role: role || "user",
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: formatUser(user),
    });
  } catch (err) {
    next(err);
  }
};

/* ---------------- LOGIN ---------------- */
exports.loginUser = async (req, res, next) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    email = email.toLowerCase().trim();

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user);

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: formatUser(user),
    });
  } catch (err) {
    next(err);
  }
};

/* ---------------- LOGOUT ---------------- */
exports.logoutUser = async (req, res) => {
  // For JWT (stateless), logout is handled client-side
  res.json({
    success: true,
    message: "Logged out successfully",
  });
};

/* ---------------- GET ME ---------------- */
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password").lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (err) {
    next(err);
  }
};
