const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");

// Load environment variables from .env file
dotenv.config({ path: ".env" });
console.log("PORT:", process.env.PORT); // Check if PORT is loaded correctly

// Import custom modules and routes
const dbconnect = require("./config/database");
const ApiError = require("./utils/ApiError");
const globalError = require("./middlewares/errorMiddlware");

const usersroute = require("./routes/userRoutes");
const authsroute = require("./routes/authRoutes");
const classroute = require("./routes/classRoutes");
const postroute = require("./routes/postRoutes");
const courseroute = require("./routes/courseRoutes");
const eventroute = require("./routes/eventRoutes");
const graderoute = require("./routes/gradeRoutes "); // 🛠️ fixed trailing space
const submitRouter = require("./routes/submitRoute");
const cartRoute = require("./routes/cartRoutes");
const favRoute = require("./routes/favRoutes");
// Initialize Express app
const app = express();

// Connect to the database
dbconnect();

// Middleware
app.use(cors());
app.use(express.json());

// Logging in development mode
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`Mode: ${process.env.NODE_ENV}`);
}

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Route mounting
app.use("/user", usersroute);
app.use("/auth", authsroute);
app.use("/class", classroute);
app.use("/post", postroute);
app.use("/course", courseroute);
app.use("/event", eventroute);
app.use("/grade", graderoute);
app.use("/submit", submitRouter);
app.use("/cart", cartRoute);
app.use("/fav", favRoute);

// Default route
app.all("/", (req, res) => {
  res.send("Welcome to the API!");
});

// Global error handler
app.use(globalError);

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error(`Unhandled Rejection Error: ${err.name} | ${err.message}`);
  server.close(() => {
    console.error("Shutting down server...");
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error(`Uncaught Exception Error: ${err.name} | ${err.message}`);
  process.exit(1);
});
