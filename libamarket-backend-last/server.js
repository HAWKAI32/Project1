const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http"); // Required for Socket.IO
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");
const { initializeSocket } = require("./sockets/socketHandler");

// Load environment variables
dotenv.config(); // Load .env file

// Connect to MongoDB
connectDB();

// Create Express app
const app = express();

// Middleware
app.use(cors({ // Configure CORS properly for production
    origin: process.env.FRONTEND_URL || "*", // Allow specific origin or all
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true // If you need to send cookies or authorization headers
}));
app.use(express.json()); // Parses incoming JSON requests

// --- Mount Routers --- //
const authRoutes = require("./routes/authRoutes");
const listingRoutes = require("./routes/listingRoutes");
const chatRoutes = require("./routes/chatRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/chat", chatRoutes);

// --- Test Route --- //
app.get("/", (req, res) => {
  res.send("LibaMarket API is running...");
});

// --- Centralized Error Handler --- //
// This MUST be the last piece of middleware loaded
app.use(errorHandler);

// --- Server and Socket.IO Setup --- //
const PORT = process.env.PORT || 5000;

// Create HTTP server manually to integrate Socket.IO
const server = http.createServer(app);

// Initialize Socket.IO
const io = initializeSocket(server);

// Start server
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  // Close server & exit process (optional, but recommended for stability)
  // server.close(() => process.exit(1));
});

