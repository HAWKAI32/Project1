const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../utils/asyncHandler");

// Helper function to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "30d",
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, phone, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    return next(new ErrorResponse("User already exists with this email", 400));
  }

  const user = await User.create({
    name,
    email,
    phone,
    password,
  });

  const verificationToken = user.createVerificationToken();
  await user.save({ validateBeforeSave: false });

  const verificationURL = `${req.protocol}://${req.get(
    "host"
  )}/api/auth/verifyemail/${verificationToken}`;

  const message = `
      <h1>Email Verification</h1>
      <p>Thank you for registering! Please verify your email by clicking the link below:</p>
      <a href="${verificationURL}" clicktracking=off>${verificationURL}</a>
      <p>This link will expire in 10 minutes.</p>
    `;

  try {
    await sendEmail({
      email: user.email,
      subject: "LibaMarket Email Verification",
      message,
    });

    res.status(201).json({
      success: true,
      message: "Registration successful! Please check your email to verify your account.",
    });
  } catch (err) {
    console.error("Email sending error:", err);
    user.verificationToken = undefined;
    user.verificationExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorResponse("Email could not be sent", 500));
  }
});

// @desc    Verify email
// @route   GET /api/auth/verifyemail/:token
// @access  Public
exports.verifyEmail = asyncHandler(async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    verificationToken: hashedToken,
    verificationExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse("Token is invalid or has expired", 400));
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationExpires = undefined;
  await user.save();

  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: "Email verified successfully!",
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      isVerified: user.isVerified,
    },
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorResponse("Please provide email and password", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  if (!user.isVerified) {
    // Optional: Resend verification email link
    // const verificationToken = user.createVerificationToken();
    // await user.save({ validateBeforeSave: false });
    // ... send email ...
    return next(new ErrorResponse("Please verify your email before logging in. Check your inbox.", 401));
  }

  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      isVerified: user.isVerified,
    },
  });
});

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (user) {
    try {
      const resetToken = user.createPasswordResetToken();
      await user.save({ validateBeforeSave: false });

      const resetURL = `${req.protocol}://${req.get(
        "host"
      )}/api/auth/resetpassword/${resetToken}`;

      const message = `
        <h1>Password Reset Request</h1>
        <p>You requested a password reset. Please click the link below to reset your password:</p>
        <a href="${resetURL}" clicktracking=off>${resetURL}</a>
        <p>This link will expire in 10 minutes. If you didn't request this, please ignore this email.</p>
      `;

      await sendEmail({
        email: user.email,
        subject: "LibaMarket Password Reset",
        message,
      });

    } catch (err) {
      console.error("Password Reset Email Error:", err);
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return next(new ErrorResponse("Email could not be sent", 500));
    }
  }

  res.status(200).json({ success: true, message: "If an account with that email exists, a password reset link has been sent." });
});

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:token
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse("Token is invalid or has expired", 400));
  }

  if (!req.body.password) {
      return next(new ErrorResponse("Please provide a new password", 400));
  }

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: "Password reset successful!",
    token,
  });
});

// @desc    Get current logged in user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  // req.user is populated by the protect middleware
  const user = req.user;

  if (!user) {
      return next(new ErrorResponse("User not found (this should not happen if protect middleware works)", 404));
  }

  res.status(200).json({
    success: true,
    data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isVerified: user.isVerified,
        createdAt: user.createdAt
    }
  });
});

// @desc    Update user profile details (name, phone)
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
    const fieldsToUpdate = {
        name: req.body.name,
        phone: req.body.phone
    };

    // Remove undefined fields so they don't overwrite existing data
    Object.keys(fieldsToUpdate).forEach(key => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]);

    if (Object.keys(fieldsToUpdate).length === 0) {
        return next(new ErrorResponse("Please provide details to update (name or phone)", 400));
    }

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            isVerified: user.isVerified,
        }
    });
});

// @desc    Update user password
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return next(new ErrorResponse("Please provide current and new password", 400));
    }

    // Get user from DB, including password
    const user = await User.findById(req.user.id).select("+password");

    // Check if current password matches
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
        return next(new ErrorResponse("Incorrect current password", 401));
    }

    // Set new password (pre-save hook will hash it)
    user.password = newPassword;
    await user.save();

    // Generate a new token and send it back
    const token = generateToken(user._id);

    res.status(200).json({
        success: true,
        message: "Password updated successfully",
        token // Send new token as password change might invalidate old ones in some setups
    });
});

// @desc    Delete user account
// @route   DELETE /api/auth/deleteaccount
// @access  Private
exports.deleteAccount = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;

    // Find the user
    const user = await User.findById(userId);

    if (!user) {
        return next(new ErrorResponse("User not found", 404));
    }

    // Optional: Add password confirmation step here if desired
    // const { password } = req.body;
    // if (!password) return next(new ErrorResponse("Please provide password to confirm deletion", 400));
    // const isMatch = await user.matchPassword(password);
    // if (!isMatch) return next(new ErrorResponse("Incorrect password", 401));

    // Perform deletion
    await user.deleteOne();

    // Optional: Delete associated data (listings, messages, conversations)
    // This can be complex and might be better handled with background jobs or DB cascades if supported
    // await Listing.deleteMany({ user: userId });
    // await Message.deleteMany({ $or: [{ sender: userId }, { receiver: userId }] });
    // await Conversation.deleteMany({ participants: userId });

    res.status(200).json({
        success: true,
        message: "Account deleted successfully",
        data: {}
    });
});

