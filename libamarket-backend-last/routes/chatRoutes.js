const express = require("express");
const router = express.Router();
const {
    sendMessage,
    getMessages,
    getConversations
} = require("../controllers/chatController");

// Import authentication middleware
const { protect } = require("../middleware/authMiddleware");

// Import validation middleware
const {
    sendMessageValidation,
    getMessagesValidation
} = require("../validators/chatValidators");

// All chat routes require the user to be logged in
router.use(protect);

// Route to send a message to a specific user
router.post("/send/:receiverId", sendMessageValidation, sendMessage);

// Route to get messages for a specific conversation
router.get("/messages/:conversationId", getMessagesValidation, getMessages);

// Route to get all conversations for the logged-in user
router.get("/conversations", getConversations); // No specific validation needed here beyond auth

module.exports = router;

