const express = require("express");
const auth = require("../middleware/authMiddleware");
const authorize = require("../middleware/authorize");
const userController = require("../controllers/userController");

const router = express.Router();

/* 🔹 Self Routes */
router.get("/me", auth, userController.getMe);
router.put("/me", auth, userController.updateMe);
router.delete("/me", auth, userController.deleteMe);

/* 🔹 Admin Routes */
router
  .route("/")
  .post(auth, authorize("admin", "staff"), userController.createUser)
  .get(auth, authorize("admin", "staff"), userController.getAllUsers);

router
  .route("/:id")
  .get(auth, authorize("admin", "staff"), userController.getUserById)
  .put(auth, authorize("admin", "staff"), userController.updateUser)
  .delete(auth, authorize("admin", "staff"), userController.deleteUser);

module.exports = router;
