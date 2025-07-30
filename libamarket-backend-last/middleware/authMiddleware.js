const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require('../utils/asyncHandler');// Use asyncHandler for consistency

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in Authorization header (Bearer token)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } 
  // Optional: Check for token in cookies (if using cookie-based sessions)
  // else if (req.cookies.token) {
  //   token = req.cookies.token;
  // }

  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse("Not authorized to access this route (no token)", 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to the request object
    // Find user by ID from token payload, exclude password
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
        // This case might happen if the user was deleted after the token was issued
        return next(new ErrorResponse("User belonging to this token no longer exists", 401));
    }

    // Optional: Check if user changed password after the token was issued (more secure)
    // if (req.user.changedPasswordAfter(decoded.iat)) {
    //   return next(new ErrorResponse('User recently changed password! Please log in again.', 401));
    // }

    next();
  } catch (err) {
    // Handle specific JWT errors or generic failure
    console.error("Token verification failed:", err);
    if (err.name === "JsonWebTokenError") {
        return next(new ErrorResponse("Not authorized, invalid token", 401));
    } else if (err.name === "TokenExpiredError") {
        return next(new ErrorResponse("Not authorized, token expired", 401));
    } else {
        return next(new ErrorResponse("Not authorized to access this route", 401));
    }
  }
});

// Optional: Grant access to specific roles (if you add roles to User model)
// exports.authorize = (...roles) => {
//   return (req, res, next) => {
//     if (!roles.includes(req.user.role)) {
//       return next(
//         new ErrorResponse(
//           `User role ${req.user.role} is not authorized to access this route`,
//           403
//         )
//       );
//     }
//     next();
//   };
// };

