const { body, param, validationResult } = require("express-validator");
const ErrorResponse = require("../utils/errorResponse");

// Middleware to handle validation errors
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Format errors for better readability (optional)
    const errorMessages = errors.array().map(err => err.msg);
    // Use the first error message for simplicity, or join them
    return next(new ErrorResponse(errorMessages[0], 400));
    // Or: return next(new ErrorResponse(`Validation Error: ${errorMessages.join(", ")}`, 400));
  }
  next();
};

// --- Validation Rules --- //

exports.registerValidation = [
  body("name", "Name is required").notEmpty().trim(),
  body("email", "Please include a valid email").isEmail().normalizeEmail(),
  body("phone", "Phone number is optional but should be valid if provided").optional().isMobilePhone("any"), // Adjust locale if needed
  body("password", "Password must be 6 or more characters").isLength({ min: 6 }),
  validateRequest // Apply validation check
];

exports.loginValidation = [
  body("email", "Please include a valid email").isEmail().normalizeEmail(),
  body("password", "Password is required").exists(),
  validateRequest
];

exports.verifyEmailValidation = [
    param("token", "Verification token is required").isHexadecimal().isLength({ min: 64, max: 64 }),
    validateRequest
];

exports.forgotPasswordValidation = [
    body("email", "Please include a valid email").isEmail().normalizeEmail(),
    validateRequest
];

exports.resetPasswordValidation = [
    param("token", "Reset token is required").isHexadecimal().isLength({ min: 64, max: 64 }),
    body("password", "Password must be 6 or more characters").isLength({ min: 6 }),
    validateRequest
];

exports.updateDetailsValidation = [
    body("name", "Name cannot be empty if provided").optional().notEmpty().trim(),
    body("phone", "Phone number should be valid if provided").optional().isMobilePhone("any"),
    // Ensure at least one field is provided (custom validation or check in controller)
    validateRequest
];

exports.updatePasswordValidation = [
    body("currentPassword", "Current password is required").exists(),
    body("newPassword", "New password must be 6 or more characters").isLength({ min: 6 }),
    validateRequest
];

// No specific validation needed for getMe or deleteAccount beyond authentication (handled by protect middleware)

