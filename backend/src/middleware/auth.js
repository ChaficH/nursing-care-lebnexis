const jwt = require("jsonwebtoken");
const config = require("../config");
const db = require("../config/db");

/**
 * Verifies the JWT from the Authorization header and attaches the decoded
 * payload to req.user. Throws 401 on missing/invalid token.
 */
async function authenticate(req, res, next) {
  const header = req.headers.authorization || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return res.status(401).json({ error: "Authentication required" });
  }

  let decoded;
  try {
    decoded = jwt.verify(match[1], config.jwt.secret);
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  try {
    const result = await db.query(
      "SELECT id, email, first_name, last_name, role, is_active FROM users WHERE id = $1",
      [decoded.userId]
    );
    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: "User no longer exists" });
    }
    if (!user.is_active) {
      return res.status(403).json({ error: "Account is deactivated" });
    }

    req.user = { ...user };
    req.auth = { userId: user.id, role: user.role };
    return next();
  } catch (err) {
    return res.status(500).json({ error: "Failed to authenticate" });
  }
}

/**
 * RBAC guard - restricts a route to one or more allowed roles.
 * Usage: router.post("/x", authenticate, authorize("patient", "admin"), handler)
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    return next();
  };
}

module.exports = { authenticate, authorize };
