const db = require("../config/db");

const SELECT_FIELDS = `
  p.id, p.user_id, p.bio, p.address, p.latitude, p.longitude,
  p.is_verified, p.status, p.created_at,
  u.first_name, u.last_name, u.email, u.phone
`;

async function listProviders(filters = {}) {
  const conditions = [];
  const params = [];
  let i = 1;

  if (filters.status) {
    conditions.push(`p.status = $${i++}`);
    params.push(filters.status);
  }
  if (filters.serviceId) {
    conditions.push(
      `EXISTS (SELECT 1 FROM provider_services ps WHERE ps.provider_id = p.id AND ps.service_id = $${i++})`
    );
    params.push(filters.serviceId);
  }
  if (filters.verified !== undefined) {
    conditions.push(`p.is_verified = $${i++}`);
    params.push(filters.verified === true || filters.verified === "true");
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const result = await db.query(
    `SELECT ${SELECT_FIELDS}
     FROM providers p
     JOIN users u ON u.id = p.user_id
     ${whereClause}
     ORDER BY p.created_at DESC`,
    params
  );
  return result.rows;
}

async function getProviderById(providerId) {
  const result = await db.query(
    `SELECT ${SELECT_FIELDS}
     FROM providers p
     JOIN users u ON u.id = p.user_id
     WHERE p.id = $1`,
    [providerId]
  );
  return result.rows[0] || null;
}

async function getProviderByUserId(userId) {
  const result = await db.query(
    `SELECT ${SELECT_FIELDS}
     FROM providers p
     JOIN users u ON u.id = p.user_id
     WHERE p.user_id = $1`,
    [userId]
  );
  return result.rows[0] || null;
}

async function updateProvider(providerId, data) {
  const current = await getProviderById(providerId);
  if (!current) return null;

  const fields = {};
  const params = [];
  let i = 1;

  const map = {
    bio: "bio",
    address: "address",
    latitude: "latitude",
    longitude: "longitude",
    isVerified: "is_verified",
  };

  for (const [key, column] of Object.entries(map)) {
    if (data[key] !== undefined) {
      fields[column] = `$${i++}`;
      params.push(data[key]);
    }
  }

  if (Object.keys(fields).length === 0) {
    return current;
  }

  const setClause = Object.entries(fields)
    .map(([col, ph]) => `"${col}" = ${ph}`)
    .join(", ");

  params.push(providerId);
  await db.query(`UPDATE providers SET ${setClause} WHERE id = $${i}`, params);
  return getProviderById(providerId);
}

/** Admin-only: update provider.status (pending|approved|suspended). */
async function updateProviderStatus(providerId, status) {
  const allowed = ["pending", "approved", "suspended"];
  if (!allowed.includes(status)) {
    const err = new Error(`status must be one of: ${allowed.join(", ")}`);
    err.statusCode = 400;
    throw err;
  }
  const result = await db.query(
    `UPDATE providers SET status = $1 WHERE id = $2 RETURNING *`,
    [status, providerId]
  );
  if (result.rowCount === 0) return null;
  return getProviderById(providerId);
}

/** Assign a service to a provider (idempotent via ON CONFLICT). */
async function assignService(providerId, serviceId) {
  await db.query(
    `INSERT INTO provider_services (provider_id, service_id)
     VALUES ($1, $2)
     ON CONFLICT (provider_id, service_id) DO NOTHING`,
    [providerId, serviceId]
  );
  return listProviderServices(providerId);
}

async function removeService(providerId, serviceId) {
  const result = await db.query(
    `DELETE FROM provider_services WHERE provider_id = $1 AND service_id = $2`,
    [providerId, serviceId]
  );
  return result.rowCount > 0;
}

async function listProviderServices(providerId) {
  const result = await db.query(
    `SELECT s.id, s.name, s.description
     FROM provider_services ps
     JOIN services s ON s.id = ps.service_id
     WHERE ps.provider_id = $1
     ORDER BY s.name`,
    [providerId]
  );
  return result.rows;
}

/** List all services (registry). */
async function listServices() {
  const result = await db.query(
    "SELECT id, name, description FROM services ORDER BY name"
  );
  return result.rows;
}

/**
 * Replace all availability slots for a provider (delete + insert in txn).
 * @param {string} providerId
 * @param {Array<{dayOfWeek, startTime, endTime}>} slots
 */
async function setAvailability(providerId, slots) {
  const dayOfWeek = (d) => {
    if (d < 0 || d > 6) {
      const err = new Error("dayOfWeek must be between 0 (Sun) and 6 (Sat)");
      err.statusCode = 400;
      throw err;
    }
    return d;
  };

  return db.withTransaction(async (client) => {
    await client.query("DELETE FROM provider_availability WHERE provider_id = $1", [
      providerId,
    ]);
    for (const slot of slots) {
      await client.query(
        `INSERT INTO provider_availability (provider_id, day_of_week, start_time, end_time)
         VALUES ($1, $2, $3, $4)`,
        [providerId, dayOfWeek(slot.dayOfWeek), slot.startTime, slot.endTime]
      );
    }
  });
}

async function addAvailabilitySlot(providerId, slot) {
  if (slot.dayOfWeek < 0 || slot.dayOfWeek > 6) {
    const err = new Error("dayOfWeek must be between 0 (Sun) and 6 (Sat)");
    err.statusCode = 400;
    throw err;
  }
  const result = await db.query(
    `INSERT INTO provider_availability (provider_id, day_of_week, start_time, end_time)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [providerId, slot.dayOfWeek, slot.startTime, slot.endTime]
  );
  return result.rows[0];
}

async function listAvailability(providerId) {
  const result = await db.query(
    `SELECT id, provider_id, day_of_week, start_time, end_time
     FROM provider_availability
     WHERE provider_id = $1
     ORDER BY day_of_week, start_time`,
    [providerId]
  );
  return result.rows;
}

async function deleteAvailabilitySlot(providerId, slotId) {
  const result = await db.query(
    `DELETE FROM provider_availability WHERE id = $1 AND provider_id = $2`,
    [slotId, providerId]
  );
  return result.rowCount > 0;
}

module.exports = {
  listProviders,
  getProviderById,
  getProviderByUserId,
  updateProvider,
  updateProviderStatus,
  assignService,
  removeService,
  listProviderServices,
  listServices,
  setAvailability,
  addAvailabilitySlot,
  listAvailability,
  deleteAvailabilitySlot,
};
