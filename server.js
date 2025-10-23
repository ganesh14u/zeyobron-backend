import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import movieRoutes from "./routes/movies.js";
import adminRoutes from "./routes/admin.js";
import categoryRoutes from "./routes/categories.js";

dotenv.config();
const app = express();

// ✅ Allowed origins for frontend
const allowedOrigins = [
  "https://zeyobron.netlify.app", // Netlify frontend
  "http://localhost:5173",        // Local dev
];

// ✅ CORS middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // Allow mobile apps or curl
      if (allowedOrigins.includes(origin)) {
        console.log(`✅ CORS allowed for origin: ${origin}`);
        callback(null, true);
      } else {
        console.warn(`❌ CORS blocked for origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Parse incoming JSON
app.use(express.json());

// ✅ Connect MongoDB
connectDB();

// ✅ Health check route
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Backend is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// ✅ API routes
app.use("/api/auth", authRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/categories", categoryRoutes);

// ✅ 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({ message: err.message || "Internal Server Error" });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
