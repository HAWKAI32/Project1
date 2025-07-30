const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const User = require("../models/User"); // Needed for populating user details
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../utils/asyncHandler");
const { getReceiverSocketId, io } = require("../sockets/socketHandler"); // Import socket related functions

// @desc    Send a message to a user
// @route   POST /api/chat/send/:receiverId
// @access  Private
exports.sendMessage = asyncHandler(async (req, res, next) => {
  const { message } = req.body;
  const { receiverId } = req.params;
  const senderId = req.user._id; // Logged in user from protect middleware

  if (!message) {
    return next(new ErrorResponse("Message content cannot be empty", 400));
  }

  // Check if receiver exists
  const receiverExists = await User.findById(receiverId);
  if (!receiverExists) {
      return next(new ErrorResponse("Receiver user not found", 404));
  }

  // Find existing conversation or create a new one
  let conversation = await Conversation.findOne({
    participants: { $all: [senderId, receiverId] },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [senderId, receiverId],
      // lastMessage will be updated below
    });
  }

  // Create the new message
  const newMessage = new Message({
    conversationId: conversation._id,
    sender: senderId,
    receiver: receiverId,
    message,
  });

  // Save message and update conversation's lastMessage in parallel
  const [savedMessage] = await Promise.all([
      newMessage.save(),
      Conversation.findByIdAndUpdate(conversation._id, { lastMessage: newMessage._id })
  ]);

  // Populate sender details for the response/socket emission
  await savedMessage.populate("sender", "name email");

  // --- Socket.IO Integration --- 
  const receiverSocketId = getReceiverSocketId(receiverId);
  if (receiverSocketId) {
      // If receiver is online, emit the new message event directly to them
      io.to(receiverSocketId).emit("newMessage", savedMessage);
      console.log(`Emitted newMessage to receiver ${receiverId} at socket ${receiverSocketId}`);
  } else {
      console.log(`Receiver ${receiverId} is offline. Message saved.`);
      // Optionally, implement push notifications here for offline users
  }
  // --- End Socket.IO --- 

  res.status(201).json({
    success: true,
    data: savedMessage,
  });
});

// @desc    Get messages for a specific conversation
// @route   GET /api/chat/messages/:conversationId
// @access  Private
exports.getMessages = asyncHandler(async (req, res, next) => {
  const { conversationId } = req.params;
  const userId = req.user._id;

  // Verify the conversation exists and the user is part of it
  const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId // Check if logged-in user is a participant
  });

  if (!conversation) {
      return next(new ErrorResponse("Conversation not found or you are not authorized", 404));
  }

  // Fetch messages for the conversation, sorted by creation time
  const messages = await Message.find({ conversationId })
    .populate("sender", "name email") // Populate sender details
    .sort({ createdAt: 1 }); // Sort oldest first

  res.status(200).json({
    success: true,
    count: messages.length,
    data: messages,
  });
});

// @desc    Get all conversations for the logged-in user
// @route   GET /api/chat/conversations
// @access  Private
exports.getConversations = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  const conversations = await Conversation.find({ participants: userId })
    .populate("participants", "name email") // Populate details of all participants
    .populate({
        path: "lastMessage",
        populate: { path: "sender", select: "name email" } // Populate sender of last message
    })
    .sort({ updatedAt: -1 }); // Sort by most recently updated conversation

  res.status(200).json({
    success: true,
    count: conversations.length,
    data: conversations,
  });
});

