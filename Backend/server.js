import express from "express";
import cors from "cors";
import "dotenv/config";
import { createServer } from "http";

import connectDb from "./lib/db.js";
import userRouter from "./Routes/userRoutes.js";
import certRouter from "./Routes/certificateRoutes.js";
import companyRouter from "./Routes/companyRoutes.js";
import companyCertRouter from "./Routes/companyCertificateRoutes.js";
import fs from "fs";
// Ensure the certificates directory exists (for Render and other hosts)
if (!fs.existsSync("certificates")) {
  fs.mkdirSync("certificates");
}
const app = express();

// ✅ Check for JWT_SECRET
if (!process.env.JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined.");
  process.exit(1);
} else {
  console.log("JWT_SECRET loaded:", process.env.JWT_SECRET);
}

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// Serve static files from certificates and uploads directories
app.use("/certificates", express.static("certificates"));
app.use("/uploads", express.static("uploads"));

// API Endpoints
app.use("/api", userRouter);  // This will handle /api/login and /api/signup
app.use("/api/certificates", certRouter);  // This will handle /api/certificates/*
app.use("/api", companyRouter);  // This will handle /api/companies/*
app.use("/api/company", companyCertRouter);  // This will handle /api/company/certificates/*

// Test route
app.get("/", (req, res) => res.send("CertGuard API Server"));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: err.message || 'Something went wrong!' 
  });
});

// Connect to database
connectDb();

const server = createServer(app);
const port = process.env.PORT || 4000;

server.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
