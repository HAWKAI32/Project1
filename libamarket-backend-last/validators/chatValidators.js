const { body, param, validationResult } = require("express-validator");
const ErrorResponse = require("../utils/errorResponse");
const mongoose = require("mongoose"); // To validate ObjectId

// Middleware to handle validation errors
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

exports.sendMessageValidation = [
    param("receiverId", "Invalid Receiver User ID format").custom(isValidObjectId),
    body("message", "Message content cannot be empty").notEmpty().trim(),
    validateRequest
];

exports.getMessagesValidation = [
    param("conversationId", "Invalid Conversation ID format").custom(isValidObjectId),
    validateRequest
];

// No specific validation needed for getConversations beyond authentication

