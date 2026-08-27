// Placeholder entrypoint — replace with the real app.
// This just proves the container, Postgres connection, and ML service link all work.
const express = require("express");
const { Pool } = require("pg");

const app = express();
const port = process.env.PORT || 3000;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.get("/", (req, res) => {
  res.json({ status: "ok", service: "nursing-care-lebnexis backend" });
});

app.get("/health/db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ db: "connected", time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ db: "error", message: err.message });
  }
});

app.get("/health/ml", async (req, res) => {
  try {
    const response = await fetch(`${process.env.ML_SERVICE_URL}/health`);
    const data = await response.json();
    res.json({ ml_service: "connected", data });
  } catch (err) {
    res.status(500).json({ ml_service: "error", message: err.message });
  }
});

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
