const db = require("../config/db");

async function listAppointments(filters = {}) {
  const conditions = [];
  const params = [];
  let i = 1;

  if (filters.patientId) {
    conditions.push(`a.patient_id = $${i++}`);
    params.push(filters.patientId);
  }
  if (filters.providerId) {
    conditions.push(`a.provider_id = $${i++}`);
    params.push(filters.providerId);
  }
  if (filters.careRequestId) {
    conditions.push(`a.care_request_id = $${i++}`);
    params.push(filters.careRequestId);
  }
  if (filters.status) {
    conditions.push(`a.status = $${i++}`);
    params.push(filters.status);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const result = await db.query(
    `SELECT a.id, a.care_request_id, a.patient_id, a.provider_id, a.scheduled_at,
            a.status, a.notes, a.created_at,
            cu.first_name AS patient_first_name, cu.last_name AS patient_last_name,
            pu.first_name AS provider_first_name, pu.last_name AS provider_last_name
     FROM appointments a
     JOIN patients pt ON pt.id = a.patient_id
     JOIN users cu ON cu.id = pt.user_id
     JOIN providers pv ON pv.id = a.provider_id
     JOIN users pu ON pu.id = pv.user_id
     ${whereClause}
     ORDER BY a.scheduled_at DESC`,
    params
  );
  return result.rows;
}

async function getAppointment(id) {
  const result = await db.query(
    `SELECT a.id, a.care_request_id, a.patient_id, a.provider_id, a.scheduled_at,
            a.status, a.notes, a.created_at,
            cu.first_name AS patient_first_name, cu.last_name AS patient_last_name,
            pu.first_name AS provider_first_name, pu.last_name AS provider_last_name
     FROM appointments a
     JOIN patients pt ON pt.id = a.patient_id
     JOIN users cu ON cu.id = pt.user_id
     JOIN providers pv ON pv.id = a.provider_id
     JOIN users pu ON pu.id = pv.user_id
     WHERE a.id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

/**
 * Schedule an appointment. Optionally verifies the provider has been
 * assigned to the care request (when the provider created an accepted
 * provider_request) to keep integrity.
 */
async function scheduleAppointment(data) {
  const { careRequestId, patientId, providerId, scheduledAt, notes, requireAssigned } = data;

  if (!scheduledAt || !patientId || !providerId) {
    const err = new Error("scheduledAt, patientId and providerId are required");
    err.statusCode = 400;
    throw err;
  }

  const appointment = await db.withTransaction(async (client) => {
    if (requireAssigned && careRequestId) {
      const assigned = await client.query(
        `SELECT 1 FROM provider_requests
         WHERE care_request_id = $1 AND provider_id = $2`,
        [careRequestId, providerId]
      );
      if (assigned.rowCount === 0) {
        const err = new Error(
          "Provider is not assigned to this care request"
        );
        err.statusCode = 400;
        throw err;
      }
    }

    const result = await client.query(
      `INSERT INTO appointments (care_request_id, patient_id, provider_id, scheduled_at, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [careRequestId ?? null, patientId, providerId, scheduledAt, notes ?? null]
    );
    return result.rows[0];
  });

  return getAppointment(appointment.id);
}

async function updateAppointment(appointmentId, data) {
  const current = await getAppointment(appointmentId);
  if (!current) return null;

  const fields = {};
  const params = [];
  let i = 1;

  const map = {
    scheduledAt: "scheduled_at",
    status: "status",
    notes: "notes",
    careRequestId: "care_request_id",
    providerId: "provider_id",
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

  params.push(appointmentId);
  await db.query(
    `UPDATE appointments SET ${setClause} WHERE id = $${i}`,
    params
  );
  return getAppointment(appointmentId);
}

async function deleteAppointment(appointmentId) {
  const result = await db.query("DELETE FROM appointments WHERE id = $1", [
    appointmentId,
  ]);
  return result.rowCount > 0;
}

/* ---------------- reviews ---------------- */

async function createReview(data) {
  const { appointmentId, patientId, providerId, rating, comment } = data;

  if (!rating || rating < 1 || rating > 5) {
    const err = new Error("rating must be between 1 and 5");
    err.statusCode = 400;
    throw err;
  }

  const review = await db.withTransaction(async (client) => {
    // MUST be a completed appointment before a review is allowed.
    const apt = await client.query(
      "SELECT id, status, patient_id, provider_id FROM appointments WHERE id = $1",
      [appointmentId]
    );
    if (!apt.rows[0]) {
      const err = new Error("Appointment not found");
      err.statusCode = 404;
      throw err;
    }
    if (apt.rows[0].status !== "completed") {
      const err = new Error("Only completed appointments can be reviewed");
      err.statusCode = 400;
      throw err;
    }

    const result = await client.query(
      `INSERT INTO reviews (appointment_id, patient_id, provider_id, rating, comment)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [appointmentId, patientId, providerId, rating, comment ?? null]
    );
    return result.rows[0];
  });

  return review;
}

async function listReviews(filters = {}) {
  const conditions = [];
  const params = [];
  let i = 1;

  if (filters.providerId) {
    conditions.push(`r.provider_id = $${i++}`);
    params.push(filters.providerId);
  }
  if (filters.patientId) {
    conditions.push(`r.patient_id = $${i++}`);
    params.push(filters.patientId);
  }
  if (filters.appointmentId) {
    conditions.push(`r.appointment_id = $${i++}`);
    params.push(filters.appointmentId);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const result = await db.query(
    `SELECT r.id, r.appointment_id, r.patient_id, r.provider_id, r.rating, r.comment, r.created_at
     FROM reviews r
     ${whereClause}
     ORDER BY r.created_at DESC`,
    params
  );
  return result.rows;
}

async function getReview(id) {
  const result = await db.query(
    `SELECT r.id, r.appointment_id, r.patient_id, r.provider_id, r.rating, r.comment, r.created_at
     FROM reviews r WHERE r.id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

module.exports = {
  listAppointments,
  getAppointment,
  scheduleAppointment,
  updateAppointment,
  deleteAppointment,
  createReview,
  listReviews,
  getReview,
};
