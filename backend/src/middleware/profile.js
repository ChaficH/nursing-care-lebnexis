const db = require("../config/db");

/**
 * Loads the provider row associated with the authenticated user.
 * Attaches req.provider and optionally blocks if the role isn't a provider.
 */
async function loadProvider(req, res, next) {
  try {
    if (req.user.role !== "provider") {
      return res.status(403).json({ error: "Provider access required" });
    }
    const result = await db.query(
      "SELECT * FROM providers WHERE user_id = $1",
      [req.user.id]
    );
    if (!result.rows[0]) {
      return res.status(404).json({ error: "Provider profile not found" });
    }
    req.provider = result.rows[0];
    return next();
  } catch (err) {
    return res.status(500).json({ error: "Failed to load provider" });
  }
}

/**
 * Loads the patient row associated with the authenticated user.
 * Attaches req.patient.
 */
async function loadPatient(req, res, next) {
  try {
    const result = await db.query(
      "SELECT * FROM patients WHERE user_id = $1",
      [req.user.id]
    );
    if (!result.rows[0]) {
      return res.status(404).json({ error: "Patient profile not found" });
    }
    req.patient = result.rows[0];
    return next();
  } catch (err) {
    return res.status(500).json({ error: "Failed to load patient" });
  }
}

module.exports = { loadProvider, loadPatient };
