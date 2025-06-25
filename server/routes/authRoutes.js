const express = require("express");
const router = express.Router();

const {
  signup,
  login,
  updateProfile,
  changePassword,
} = require("../controllers/authController");

const verifyToken = require("../middleware/verifyToken");

// Public routes
router.post("/signup", signup);
router.post("/login", login);

// Protected routes (if needed)
router.put("/profile", verifyToken, updateProfile);
router.put("/password", verifyToken, changePassword);

module.exports = router;
