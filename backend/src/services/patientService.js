const db = require("../config/db");

const SELECT_FIELDS = `
  p.id, p.user_id, p.managed_by_user_id, p.date_of_birth, p.address,
  p.latitude, p.longitude, p.created_at,
  u.first_name, u.last_name, u.email, u.phone
`;

async function listPatients() {
  const result = await db.query(
    `SELECT ${SELECT_FIELDS}
     FROM patients p
     JOIN users u ON u.id = p.user_id
     ORDER BY p.created_at DESC`
  );
  return result.rows;
}

/** Patients managed by a proxy user (managed_by_user_id). */
async function listManagedPatients(managerUserId) {
  const result = await db.query(
    `SELECT ${SELECT_FIELDS}
     FROM patients p
     JOIN users u ON u.id = p.user_id
     WHERE p.managed_by_user_id = $1
     ORDER BY p.created_at DESC`,
    [managerUserId]
  );
  return result.rows;
}

async function getPatientById(patientId) {
  const result = await db.query(
    `SELECT ${SELECT_FIELDS}
     FROM patients p
     JOIN users u ON u.id = p.user_id
     WHERE p.id = $1`,
    [patientId]
  );
  return result.rows[0] || null;
}

/** Get a patient by their linked user_id. */
async function getPatientByUserId(userId) {
  const result = await db.query(
    `SELECT ${SELECT_FIELDS}
     FROM patients p
     JOIN users u ON u.id = p.user_id
     WHERE p.user_id = $1`,
    [userId]
  );
  return result.rows[0] || null;
}

async function createPatient(data) {
  const {
    userId,
    managedByUserId = null,
    dateOfBirth = null,
    address = null,
    latitude = null,
    longitude = null,
  } = data;

  // Allow creating a fresh user at the same time via the auth flow, but this
  // endpoint requires an existing user_id to link against.
  const result = await db.query(
    `INSERT INTO patients (user_id, managed_by_user_id, date_of_birth, address, latitude, longitude)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [userId, managedByUserId, dateOfBirth, address, latitude, longitude]
  );
  return getPatientById(result.rows[0].id);
}

async function updatePatient(patientId, data) {
  const current = await getPatientById(patientId);
  if (!current) return null;

  const fields = {};
  const params = [];
  let i = 1;

  const map = {
    managedByUserId: "managed_by_user_id",
    dateOfBirth: "date_of_birth",
    address: "address",
    latitude: "latitude",
    longitude: "longitude",
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

  params.push(patientId);
  await db.query(
    `UPDATE patients SET ${setClause} WHERE id = $${i} RETURNING *`,
    params
  );
  return getPatientById(patientId);
}

async function deletePatient(patientId) {
  const result = await db.query("DELETE FROM patients WHERE id = $1", [
    patientId,
  ]);
  return result.rowCount > 0;
}

module.exports = {
  listPatients,
  listManagedPatients,
  getPatientById,
  getPatientByUserId,
  createPatient,
  updatePatient,
  deletePatient,
};
