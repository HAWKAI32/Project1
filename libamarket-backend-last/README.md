# LibaMarket Backend API

This is the backend API for LibaMarket, an OLX-style marketplace application built with Node.js, Express, and MongoDB. It provides functionalities for user authentication, listing management, and real-time chat.

## Features

*   **User Authentication:**
    *   User Registration with Email Verification
    *   User Login (JWT-based)
    *   Password Reset (Forgot Password)
    *   Get User Profile (`/me`)
    *   Update User Details (name, phone)
    *   Update Password
    *   Delete Account
*   **Listings Management (CRUD):**
    *   Create New Listing (Authenticated)
    *   Get All Listings (Public, with filtering, sorting, pagination)
    *   Get Single Listing by ID (Public)
    *   Update Listing (Owner only)
    *   Delete Listing (Owner only)
*   **Real-time Chat:**
    *   Send Message between Users (Authenticated)
    *   Get Messages for a Conversation (Authenticated)
    *   Get User's Conversations (Authenticated)
    *   Real-time message delivery using Socket.IO
    *   Online user status tracking (basic)
*   **Robust Backend:**
    *   Modular Folder Structure
    *   Asynchronous Error Handling
    *   Request Validation using `express-validator`
    *   Centralized Error Handling Middleware
    *   Environment Variable Configuration (`.env`)

## Folder Structure

The project follows a modular structure to keep the codebase organized and maintainable:

```
libamarket-backend/
├── config/             # Database connection (db.js)
├── controllers/        # Request handling logic (authController.js, listingController.js, chatController.js)
├── middleware/         # Custom middleware (authMiddleware.js, errorHandler.js)
├── models/             # Mongoose schemas (User.js, Listing.js, Conversation.js, Message.js)
├── node_modules/       # Project dependencies (managed by npm)
├── routes/             # API route definitions (authRoutes.js, listingRoutes.js, chatRoutes.js)
├── sockets/            # Socket.IO setup and handlers (socketHandler.js)
├── utils/              # Utility functions (sendEmail.js, errorResponse.js, asyncHandler.js)
├── validators/         # Request validation rules (authValidators.js, listingValidators.js, chatValidators.js)
├── .env.example        # Example environment variables file
├── .gitignore          # Specifies intentionally untracked files that Git should ignore
├── package.json        # Project metadata and dependencies
├── package-lock.json   # Records exact versions of dependencies
├── server.js           # Main application entry point
└── README.md           # This file
```

## Prerequisites

*   [Node.js](https://nodejs.org/) (v14 or later recommended)
*   [npm](https://www.npmjs.com/) (usually comes with Node.js)
*   [MongoDB](https://www.mongodb.com/try/download/community) (running locally or using a cloud service like MongoDB Atlas)
*   An email testing service like [Mailtrap.io](https://mailtrap.io/) (for development/testing email features) or a production email provider (SendGrid, Mailgun, etc.).

## Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd libamarket-backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

## Configuration

1.  **Create Environment File:**
    Rename the `.env.example` file to `.env`.
    ```bash
    cp .env.example .env
    ```

2.  **Edit `.env` file:**
    Open the `.env` file and fill in the required values:
    *   `NODE_ENV`: Set to `development` or `production`.
    *   `PORT`: The port the server will run on (e.g., `5000`).
    *   `MONGO_URI`: Your MongoDB connection string.
        *   Local example: `mongodb://127.0.0.1:27017/libamarket`
        *   Atlas example: `mongodb+srv://<username>:<password>@<cluster-url>/libamarket?retryWrites=true&w=majority`
    *   `JWT_SECRET`: A strong, unique secret key for signing JWT tokens.
    *   `JWT_EXPIRE`: Token expiration time (e.g., `30d`, `1h`).
    *   `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USERNAME`, `EMAIL_PASSWORD`: Credentials for your email service (e.g., Mailtrap for development).
    *   `EMAIL_FROM`: The sender email address for verification/reset emails.
    *   `FRONTEND_URL`: The URL of your frontend application (used for CORS and email links, e.g., `http://localhost:3000` for local Flutter dev).

## Running the Application

1.  **Development Mode (with nodemon for auto-restarts):**
    Make sure you have `nodemon` installed (`npm install -g nodemon`) or add it as a dev dependency (`npm install --save-dev nodemon`) and add a script to `package.json`:
    ```json
    // package.json
    "scripts": {
      "start": "node server.js",
      "dev": "nodemon server.js"
    }
    ```
    Then run:
    ```bash
    npm run dev
    ```

2.  **Production Mode:**
    ```bash
    npm start
    ```

The server should now be running on the port specified in your `.env` file (defaulting to 5000).

## API Endpoints

(A brief overview - use tools like Postman or Insomnia to test)

*   **Authentication (`/api/auth`)**
    *   `POST /register`: Register a new user.
    *   `POST /login`: Login an existing user.
    *   `GET /verifyemail/:token`: Verify email address using token.
    *   `POST /forgotpassword`: Request a password reset link.
    *   `PUT /resetpassword/:token`: Reset password using token.
    *   `GET /me` (Protected): Get current user's profile.
    *   `PUT /updatedetails` (Protected): Update user's name/phone.
    *   `PUT /updatepassword` (Protected): Update user's password.
    *   `DELETE /deleteaccount` (Protected): Delete user's account.

*   **Listings (`/api/listings`)**
    *   `POST /` (Protected): Create a new listing.
    *   `GET /`: Get all listings (supports filtering, sorting, pagination via query params).
    *   `GET /:id`: Get a single listing by ID.
    *   `PUT /:id` (Protected): Update a listing (owner only).
    *   `DELETE /:id` (Protected): Delete a listing (owner only).

*   **Chat (`/api/chat`)** (All Protected)
    *   `POST /send/:receiverId`: Send a message to another user.
    *   `GET /messages/:conversationId`: Get messages for a specific conversation.
    *   `GET /conversations`: Get all conversations for the logged-in user.

## Key Concepts Explained

*   **JWT (JSON Web Tokens):** Used for stateless authentication. After login/verification, a token is issued to the client, which must be sent in the `Authorization: Bearer <token>` header for protected routes.
*   **Middleware:** Functions that execute during the request-response cycle. Used here for authentication (`protect`), error handling (`errorHandler`), and request validation.
*   **Socket.IO:** Enables real-time, bidirectional communication between clients and the server, used here for the chat feature.
*   **Mongoose:** An Object Data Modeling (ODM) library for MongoDB and Node.js. It manages relationships between data, provides schema validation, and is used to translate between objects in code and the representation of those objects in MongoDB.
*   **express-validator:** Middleware library for validating incoming request data.
*   **asyncHandler:** A simple utility wrapper to avoid repetitive try-catch blocks in asynchronous route handlers, passing errors automatically to the error handling middleware.


