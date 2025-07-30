const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User", // Reference to the User model
  },
  title: {
    type: String,
    required: [true, "Please provide a title"],
    trim: true,
    maxlength: [100, "Title cannot be more than 100 characters"],
  },
  description: {
    type: String,
    required: [true, "Please provide a description"],
    maxlength: [1000, "Description cannot be more than 1000 characters"],
  },
  price: {
    type: Number,
    required: [true, "Please provide a price"],
    min: [0, "Price must be a positive number"],
  },
  category: {
    type: String,
    required: [true, "Please provide a category"],
    // Consider using an enum for predefined categories in a real app
    // enum: ["Cars", "Phones", "Property", "Electronics", "Fashion", "Other"],
  },
  location: {
    type: String,
    required: [true, "Please provide a location"],
  },
  images: {
    type: [String], // Array of image URLs
    validate: [arrayLimit, "{PATH} exceeds the limit of 10 images"],
    default: [],
  },
  isPromoted: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Validator function for images array limit
function arrayLimit(val) {
  return val.length <= 10;
}

// Add index for potential search/filtering optimization
listingSchema.index({ category: 1, location: 1 });
listingSchema.index({ title: "text", description: "text" }); // For text search

module.exports = mongoose.model("Listing", listingSchema);

