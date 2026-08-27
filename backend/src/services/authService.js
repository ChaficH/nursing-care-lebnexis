const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const config = require("../config");

const BCRYPT_ROUNDS = 10;

/**
 * Register a new user and create the linked profile row inside a transaction.
 * @param {object} payload - { email, password, firstName, lastName, phone,
 *   role (patient|provider), preferredLanguage, profile }
 * @returns {object} the newly created user row
 */
async function registerUser(payload) {
  const {
    email,
    password,
    firstName,
    lastName,
    phone,
    role,
    preferredLanguage = "en",
    profile = {},
  } = payload;

  if (!["patient", "provider"].includes(role)) {
    const err = new Error("role must be 'patient' or 'provider'");
    err.statusCode = 400;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const user = await db.withTransaction(async (client) => {
    const userResult = await client.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone, role, preferred_language)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, email, first_name, last_name, phone, role, preferred_language, is_active, created_at`,
      [email, passwordHash, firstName, lastName, phone, role, preferredLanguage]
    );
    const newUser = userResult.rows[0];

    if (role === "patient") {
      await client.query(
        `INSERT INTO patients (user_id, managed_by_user_id, date_of_birth, address, latitude, longitude)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          newUser.id,
          profile.managedByUserId || null,
          profile.dateOfBirth || null,
          profile.address || null,
          profile.latitude ?? null,
          profile.longitude ?? null,
        ]
      );
    } else {
      await client.query(
        `INSERT INTO providers (user_id, bio, address, latitude, longitude, status)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          newUser.id,
          profile.bio || null,
          profile.address || null,
          profile.latitude ?? null,
          profile.longitude ?? null,
          profile.status || "pending",
        ]
      );
    }

    return newUser;
  });

  return user;
}

/**
 * Validate credentials and return the user row (without the password hash).
 */
async function loginUser(email, password) {
  const result = await db.query(
    `SELECT id, email, password_hash, first_name, last_name, role, is_active
     FROM users WHERE email = $1`,
    [email]
  );
  const user = result.rows[0];
  if (!user) {
    return null;
  }
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return null;
  }
  if (!user.is_active) {
    const err = new Error("Account is deactivated");
    err.statusCode = 403;
    throw err;
  }

  delete user.password_hash;
  return user;
}

function signToken(user) {
  return jwt.sign({ userId: user.id, role: user.role }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
}

/**
 * Get the full auth-visible user + profile details by user id.
 */
async function getMe(userId) {
  const userResult = await db.query(
    `SELECT id, email, first_name, last_name, phone, role, preferred_language, is_active, created_at, updated_at
     FROM users WHERE id = $1`,
    [userId]
  );
  const user = userResult.rows[0];
  if (!user) return null;

  if (user.role === "patient") {
    const p = await db.query("SELECT * FROM patients WHERE user_id = $1", [
      userId,
    ]);
    user.patient = p.rows[0] || null;
  } else if (user.role === "provider") {
    const p = await db.query("SELECT * FROM providers WHERE user_id = $1", [
      userId,
    ]);
    user.provider = p.rows[0] || null;
  }
  return user;
}

module.exports = {
  registerUser,
  loginUser,
  signToken,
  getMe,
};
