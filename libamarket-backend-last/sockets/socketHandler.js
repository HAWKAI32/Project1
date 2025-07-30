const { Server } = require("socket.io");

let io;
const userSocketMap = {}; // { userId: socketId }

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "*", // Allow requests from frontend URL or all origins
      methods: ["GET", "POST"],
    },
  });

  console.log("Socket.IO initialized");

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    const userId = socket.handshake.query.userId;
    if (userId && userId !== "undefined") {
        console.log(`User ${userId} connected with socket ${socket.id}`);
        userSocketMap[userId] = socket.id;
        // Emit event to all connected clients about online users (optional)
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    } else {
        console.log(`User connected without userId: ${socket.id}`);
    }

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      // Remove user from map
      for (const [key, value] of Object.entries(userSocketMap)) {
          if (value === socket.id) {
              delete userSocketMap[key];
              console.log(`Removed user ${key} from socket map`);
              break;
          }
      }
      // Emit updated online users list
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });

    // Listen for other custom events from client if needed
    // socket.on("typing", ({ receiverId }) => { ... });
    // socket.on("stopTyping", ({ receiverId }) => { ... });

  });

  return io;
};

const getReceiverSocketId = (receiverId) => {
    return userSocketMap[receiverId];
};

// Export io instance and helper function
module.exports = { initializeSocket, getReceiverSocketId, get io() { return io; } }; // Use getter for io

