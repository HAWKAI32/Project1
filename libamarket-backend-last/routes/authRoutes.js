const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getMe,
  updateDetails,
  updatePassword,
  deleteAccount,
} = require("../controllers/authController");

// Import authentication middleware
const { protect } = require("../middleware/authMiddleware");

// Import validation middleware
const {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  updateDetailsValidation,
  updatePasswordValidation,
} = require("../validators/authValidators");

// Public routes with validation
router.post("/register", registerValidation, registerUser);
router.post("/login", loginValidation, loginUser);
router.get("/verifyemail/:token", verifyEmail); // Removed invalid verifyEmailValidation
router.post("/forgotpassword", forgotPasswordValidation, forgotPassword);
router.put("/resetpassword/:token", resetPasswordValidation, resetPassword);

// Protected routes (require authentication)
router.get("/me", protect, getMe);
router.put("/updatedetails", protect, updateDetailsValidation, updateDetails);
router.put("/updatepassword", protect, updatePasswordValidation, updatePassword);
router.delete("/deleteaccount", protect, deleteAccount); // No additional validation needed

console.log("authRoutes loaded with validation, verification, password reset, and profile management.");
module.exports = router;