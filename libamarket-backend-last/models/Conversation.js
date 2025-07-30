const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null
    }
    // Timestamps (createdAt, updatedAt) are added automatically by the second argument
  },
  { timestamps: true }
);

// Ensure unique conversations between the same set of participants
// Note: Order matters in the array, so [userA, userB] is different from [userB, userA]
// A pre-save hook might be needed to always store participants in a sorted order
// Or, application logic should handle finding conversations regardless of participant order.
// For simplicity here, we rely on application logic to manage this.

module.exports = mongoose.model("Conversation", conversationSchema);

