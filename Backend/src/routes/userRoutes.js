const express = require("express");
const auth = require("../middleware/authMiddleware");
const authAdmin = require("../middleware/authAdmin");
const userController = require("../controllers/userController");

const router = express.Router();

// --- Personal Routes (Standard User) ---
// Note: These must come BEFORE /:id routes
router.get("/me", auth, userController.getMe);
router.put("/me", auth, userController.updateMe);
router.delete("/me", auth, userController.deleteMe);

// --- Admin Routes ---
router.post("/", auth, authAdmin, userController.createUser);
router.get("/", auth, authAdmin, userController.getAllUsers); // Should likely be protected by authAdmin
router.get("/:id", auth, authAdmin, userController.getUserById); // Should likely be protected by authAdmin
router.put("/:id", auth, authAdmin, userController.updateUser);
router.delete("/:id", auth, authAdmin, userController.deleteUser);

module.exports = router;
