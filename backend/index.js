const express = require("express");
const config = require("./src/config");
const { pool } = require("./src/config/db");
const {
  notFoundHandler,
  errorHandler
} = require("./src/middleware/errorHandler");

const authRoutes = require("./src/routes/auth.routes");
const patientRoutes = require("./src/routes/patient.routes");
const providerRoutes = require("./src/routes/provider.routes");
const careRequestRoutes = require("./src/routes/careRequest.routes");
const appointmentRoutes = require("./src/routes/appointment.routes");
const reviewRoutes = require("./src/routes/review.routes");

const app = express();
const port = config.port;

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "nursing-care-lebnexis backend"
  });
});


// ===============================
// Check Database Connection
// ===============================

const checkDatabaseConnection = async () => {
  try {
    const result = await pool.query("SELECT NOW()");

    console.log("✅ PostgreSQL connected successfully");
    console.log("🕐 Database time:", result.rows[0].now);

  } catch (error) {
    console.error("❌ PostgreSQL connection failed");
    console.error("Error:", error.message);
  }
};


// ===============================
// Database Health Check
// ===============================

app.get("/health/db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      db: "connected",
      time: result.rows[0].now
    });

  } catch (err) {
    res.status(500).json({
      db: "error",
      message: err.message
    });
  }
});


// ===============================
// ML Health Check
// ===============================

app.get("/health/ml", async (req, res) => {
  try {
    const response = await fetch(
      `${config.mlServiceUrl}/health`
    );

    const data = await response.json();

    res.json({
      ml_service: "connected",
      data
    });

  } catch (err) {
    res.status(500).json({
      ml_service: "error",
      message: err.message
    });
  }
});


// ===============================
// API Routes
// ===============================

app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/providers", providerRoutes);
app.use("/api/care-requests", careRequestRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/reviews", reviewRoutes);


// ===============================
// 404 + Error Handling
// ===============================

app.use(notFoundHandler);
app.use(errorHandler);


// ===============================
// Start Server
// ===============================

app.listen(port, async () => {
  console.log(`Backend listening on port ${port}`);

  // Check PostgreSQL connection
  await checkDatabaseConnection();
});


module.exports = app;