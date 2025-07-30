const express = require("express");
const router = express.Router();
const {
  createListing,
  getListings,
  getListingById,
  updateListing,
  deleteListing,
} = require("../controllers/listingController");

// Import authentication middleware
const { protect } = require("../middleware/authMiddleware");

// Import validation middleware
const {
    createListingValidation,
    getListingsValidation,
    listingIdParamValidation,
    updateListingValidation
} = require("../validators/listingValidators");

// Route to get all listings (public) and create a new listing (private)
router.route("/")
  .get(getListingsValidation, getListings) // Add validation for query params
  .post(protect, createListingValidation, createListing); // Add validation for creation

// Route to get, update, and delete a specific listing by ID
router.route("/:id")
  .get(listingIdParamValidation, getListingById) // Add ID validation
  .put(protect, updateListingValidation, updateListing) // Add ID and body validation
  .delete(protect, listingIdParamValidation, deleteListing); // Add ID validation

module.exports = router;

