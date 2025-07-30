const { body, param, query, validationResult } = require("express-validator");
const ErrorResponse = require("../utils/errorResponse");
const mongoose = require("mongoose"); // To validate ObjectId

// Middleware to handle validation errors (can be reused or defined centrally)
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => err.msg);
    return next(new ErrorResponse(errorMessages[0], 400));
  }
  next();
};

// Helper to check for valid MongoDB ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// --- Validation Rules --- //

exports.createListingValidation = [
  body("title", "Title is required and cannot exceed 100 characters").notEmpty().trim().isLength({ max: 100 }),
  body("description", "Description is required and cannot exceed 1000 characters").notEmpty().trim().isLength({ max: 1000 }),
  body("price", "Price is required and must be a non-negative number").isFloat({ min: 0 }),
  body("category", "Category is required").notEmpty().trim(),
  body("location", "Location is required").notEmpty().trim(),
  body("images", "Images must be an array of strings (URLs) and cannot exceed 10 images")
    .optional()
    .isArray({ max: 10 })
    .custom((images) => images.every(img => typeof img === "string")),
  body("isPromoted", "isPromoted must be a boolean").optional().isBoolean(),
  validateRequest
];

exports.getListingsValidation = [
    // Optional query parameter validation
    query("category", "Category filter must be a string").optional().isString().trim(),
    query("location", "Location filter must be a string").optional().isString().trim(),
    query("minPrice", "Minimum price must be a number").optional().isFloat({ min: 0 }),
    query("maxPrice", "Maximum price must be a number").optional().isFloat({ min: 0 }),
    query("page", "Page must be a positive integer").optional().isInt({ min: 1 }),
    query("limit", "Limit must be a positive integer").optional().isInt({ min: 1 }),
    query("sort", "Sort parameter must be a string").optional().isString().trim(),
    query("select", "Select parameter must be a string").optional().isString().trim(),
    validateRequest
];

exports.listingIdParamValidation = [
    param("id", "Invalid Listing ID format").custom(isValidObjectId),
    validateRequest
];

exports.updateListingValidation = [
    param("id", "Invalid Listing ID format").custom(isValidObjectId),
    // Optional body fields validation (similar to create, but optional)
    body("title", "Title cannot exceed 100 characters").optional().trim().isLength({ max: 100 }),
    body("description", "Description cannot exceed 1000 characters").optional().trim().isLength({ max: 1000 }),
    body("price", "Price must be a non-negative number").optional().isFloat({ min: 0 }),
    body("category", "Category must be a string").optional().trim(),
    body("location", "Location must be a string").optional().trim(),
    body("images", "Images must be an array of strings (URLs) and cannot exceed 10 images")
        .optional()
        .isArray({ max: 10 })
        .custom((images) => images.every(img => typeof img === "string")),
    body("isPromoted", "isPromoted must be a boolean").optional().isBoolean(),
    // Ensure at least one field is provided (can be checked in controller or here)
    validateRequest
];

// No specific validation needed for getListingById or deleteListing beyond ID format and authentication

