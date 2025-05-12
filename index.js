const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");
const axios = require("axios"); // Import axios to make requests

const dbconnect = require("./config/database");
const ApiError = require("./utils/ApiError");
const globelError = require("./middlewares/errorMiddlware");

const usersroute = require("./routes/userRoutes");
const authsroute = require("./routes/authRoutes");
const classroute = require("./routes/classRoutes");
const postroute = require("./routes/postRoutes");
const courseroute = require("./routes/courseRoutes");
const eventroute = require("./routes/eventRoutes");
const graderoute = require("./routes/gradeRoutes ");
const submitRouter = require("./routes/submitRoute");
const cartRoute = require("./routes/cartRoutes");
const checkoutRoute = require("./routes/checkoutRoute");
const favRoute = require("./routes/favRoutes");
const generateAssignmentRoute = require("./routes/generateAssignmentRoutes");

// Load environment variables from .env file
dotenv.config({ path: ".env" });

// Create the Express app instance
const app = express();

// Middleware - parsing JSON requests
app.use(express.json());

// Middleware - CORS to allow requests from different origins
app.use(cors());

// Use Morgan for logging in development mode
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`Running in ${process.env.NODE_ENV} mode`);
}

// Connect to the database
dbconnect(); // Make sure this handles DB connection errors properly

// Set up Hugging Face API Key and Endpoint
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY; // Set this in your .env file
const HUGGINGFACE_API_URL = "https://api-inference.huggingface.co/models/gpt2"; // Example with GPT-2 model

// Function to interact with Hugging Face API
const queryHuggingFaceAPI = async (inputText) => {
  try {
    const response = await axios.post(
      HUGGINGFACE_API_URL,
      { inputs: inputText },
      {
        headers: {
          Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error calling Hugging Face API:", error);
    throw new Error("Error calling Hugging Face API");
  }
};

// Example route to use Hugging Face model
app.post("/generate-text", async (req, res, next) => {
  try {
    const { inputText } = req.body;
    const generatedText = await queryHuggingFaceAPI(inputText);
    res.json({ generatedText });
  } catch (error) {
    next(error);
  }
});

// Mount routes
app.use(`/user`, usersroute);
app.use(`/auth`, authsroute);
app.use(`/class`, classroute);
app.use(`/post`, postroute);
app.use(`/course`, courseroute);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(`/event`, eventroute);
app.use(`/grade`, graderoute);
app.use(`/submit`, submitRouter);
app.use(`/cart`, cartRoute);
app.use(`/checkout`, checkoutRoute);
app.use(`/fav`, favRoute);
app.use(`/generateAssignment`, generateAssignmentRoute);

// Root endpoint for testing
app.all("/", (req, res) => {
  res.send("Welcome to the API!");
});

// Global error handling middleware
app.use(globelError);

// Start the server
const server = app.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on http://localhost:${server.address().port}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error(`Unhandled Rejection Error: ${err.name} | ${err.message}`);
  server.close(() => {
    console.error("Shutting down server due to unhandled rejection...");
    process.exit(1);
  });
});

// Handle uncaught exceptions (unhandled errors)
process.on("uncaughtException", (err) => {
  console.error(`Uncaught Exception Error: ${err.name} | ${err.message}`);
  process.exit(1); // Exit process after logging the uncaught exception
});
// Handle uncaught exceptions (unhandled errors)
process.on("uncaughtException", (err) => {
  console.error(`Uncaught Exception Error: ${err.name} | ${err.message}`);
  process.exit(1); // Exit process after logging the uncaught exception
});
