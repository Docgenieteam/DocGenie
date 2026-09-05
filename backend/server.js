const dotenv = require("dotenv");

dotenv.config();

const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const documentRoutes = require("./routes/documentRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/notifications", notificationRoutes);

// Temporary deployment test route
app.get("/api/test-route", (req, res) => {
  res.json({
    success: true,
    message: "NEW CODE IS RUNNING",
  });
});

// Root health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "DocGenie Backend is running",
  });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`DocGenie backend running on port ${PORT}`);
});
