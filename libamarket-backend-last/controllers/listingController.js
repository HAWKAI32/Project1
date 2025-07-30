const Listing = require("../models/Listing");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Create a new listing
// @route   POST /api/listings
// @access  Private (requires login)
exports.createListing = asyncHandler(async (req, res, next) => {
  // Add user ID from protect middleware to the request body
  req.body.user = req.user.id; // req.user is set by the protect middleware

  const listing = await Listing.create(req.body);

  res.status(201).json({
    success: true,
    data: listing,
  });
});

// @desc    Get all listings with filtering and pagination
// @route   GET /api/listings
// @access  Public
exports.getListings = asyncHandler(async (req, res, next) => {
  let query;

  // Copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude from filtering (like pagination, sorting)
  const removeFields = ["select", "sort", "page", "limit"];

  // Loop over removeFields and delete them from reqQuery
  removeFields.forEach((param) => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);

  // Create operators ($gt, $gte, etc)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`);

  // Finding resource
  query = Listing.find(JSON.parse(queryStr)).populate("user", "name email"); // Populate user details

  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(",").join(" ");
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createdAt"); // Default sort by creation date
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10; // Default 10 per page
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Listing.countDocuments(JSON.parse(queryStr)); // Count documents matching filter

  query = query.skip(startIndex).limit(limit);

  // Executing query
  const listings = await query;

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }

  res.status(200).json({
    success: true,
    count: listings.length,
    totalCount: total,
    pagination,
    data: listings,
  });
});

// @desc    Get single listing by ID
// @route   GET /api/listings/:id
// @access  Public
exports.getListingById = asyncHandler(async (req, res, next) => {
  const listing = await Listing.findById(req.params.id).populate(
    "user",
    "name email phone"
  ); // Populate user details

  if (!listing) {
    return next(
      new ErrorResponse(`Listing not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: listing,
  });
});

// @desc    Update a listing
// @route   PUT /api/listings/:id
// @access  Private (owner only)
exports.updateListing = asyncHandler(async (req, res, next) => {
  let listing = await Listing.findById(req.params.id);

  if (!listing) {
    return next(
      new ErrorResponse(`Listing not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is listing owner
  if (listing.user.toString() !== req.user.id) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this listing`,
        401
      )
    );
  }

  // Prevent user field from being updated
  if (req.body.user) {
      delete req.body.user;
  }

  listing = await Listing.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // Return the modified document
    runValidators: true, // Run model validators on update
  });

  res.status(200).json({
    success: true,
    data: listing,
  });
});

// @desc    Delete a listing
// @route   DELETE /api/listings/:id
// @access  Private (owner only)
exports.deleteListing = asyncHandler(async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    return next(
      new ErrorResponse(`Listing not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is listing owner
  if (listing.user.toString() !== req.user.id) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this listing`,
        401
      )
    );
  }

  await listing.deleteOne(); // Use deleteOne() which triggers middleware if needed (though not used here)

  res.status(200).json({
    success: true,
    data: {}, // Return empty object on successful deletion
  });
});

