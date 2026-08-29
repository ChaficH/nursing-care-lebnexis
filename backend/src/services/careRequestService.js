const db = require("../config/db");

const CARE_REQUEST_FIELDS = `
  cr.id, cr.patient_id, cr.description, cr.urgency, cr.address,
  cr.latitude, cr.longitude, cr.status, cr.created_at, cr.updated_at,
  p.user_id AS patient_user_id
`;

async function listCareRequests(filters = {}) {
  const conditions = [];
  const params = [];
  let i = 1;

  if (filters.patientId) {
    conditions.push(`cr.patient_id = $${i++}`);
    params.push(filters.patientId);
  }
  if (filters.status) {
    conditions.push(`cr.status = $${i++}`);
    params.push(filters.status);
  }
  if (filters.urgency) {
    conditions.push(`cr.urgency = $${i++}`);
    params.push(filters.urgency);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const result = await db.query(
    `SELECT ${CARE_REQUEST_FIELDS}
     FROM care_requests cr
     JOIN patients p ON p.id = cr.patient_id
     ${whereClause}
     ORDER BY cr.created_at DESC`,
    params
  );
  return result.rows;
}

async function getCareRequest(id) {
  const result = await db.query(
    `SELECT ${CARE_REQUEST_FIELDS}
     FROM care_requests cr
     JOIN patients p ON p.id = cr.patient_id
     WHERE cr.id = $1`,
    [id]
  );
  const careRequest = result.rows[0];
  if (!careRequest) return null;

  careRequest.services = await listCareRequestServices(id);
  careRequest.aiAnalysis = await getAiAnalysis(id);
  return careRequest;
}

/**
 * Create a care request, optionally linking services (care_request_services)
 * and writing an AI analysis row (ai_request_analysis) in one transaction.
 * @param {object} payload
 * @param {object} payload.ai - { structuredData, generatedSummary, urgency, disclaimer }
 * @param {Array<{serviceId, confidenceScore, source}>} payload.services
 */
async function createCareRequest(payload) {
  const {
    patientId,
    description,
    urgency = "medium",
    address = null,
    latitude = null,
    longitude = null,
    services = [],
    ai = {},
  } = payload;

  const careRequest = await db.withTransaction(async (client) => {
    const crResult = await client.query(
      `INSERT INTO care_requests (patient_id, description, urgency, address, latitude, longitude)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, patient_id, description, urgency, address, latitude, longitude, status, created_at, updated_at`,
      [patientId, description, urgency, address, latitude, longitude]
    );
    const cr = crResult.rows[0];

    for (const s of services) {
      if (!s.serviceId) continue;
      await client.query(
        `INSERT INTO care_request_services (care_request_id, service_id, confidence_score, source)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (care_request_id, service_id) DO NOTHING`,
        [
          cr.id,
          s.serviceId,
          s.confidenceScore ?? null,
          s.source || "user",
        ]
      );
    }

    if (ai && Object.keys(ai).length > 0) {
      await client.query(
        `INSERT INTO ai_request_analysis (care_request_id, structured_data, generated_summary, urgency, disclaimer)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          cr.id,
          ai.structuredData ? JSON.stringify(ai.structuredData) : null,
          ai.generatedSummary ?? null,
          ai.urgency ?? null,
          ai.disclaimer ?? null,
        ]
      );
    }

    // Automatically notify matching providers by creating provider_requests.
    const providers = await client.query(
      `SELECT DISTINCT p.id
       FROM providers p
       JOIN provider_services ps ON ps.provider_id = p.id
       JOIN care_request_services crs ON crs.service_id = ps.service_id
       WHERE crs.care_request_id = $1 AND p.status = 'approved'`,
      [cr.id]
    );
    for (const prov of providers.rows) {
      await client.query(
        `INSERT INTO provider_requests (care_request_id, provider_id, status)
         VALUES ($1, $2, 'pending')
         ON CONFLICT (care_request_id, provider_id) DO NOTHING`,
        [cr.id, prov.id]
      );
    }

    return cr;
  });

  return getCareRequest(careRequest.id);
}

async function updateCareRequest(id, data) {
  const current = await getCareRequest(id);
  if (!current) return null;

  const fields = {};
  const params = [];
  let i = 1;

  const map = {
    description: "description",
    urgency: "urgency",
    address: "address",
    latitude: "latitude",
    longitude: "longitude",
    status: "status",
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

  params.push(id);
  await db.query(
    `UPDATE care_requests SET ${setClause}, updated_at = NOW() WHERE id = $${i}`,
    params
  );
  return getCareRequest(id);
}

async function deleteCareRequest(id) {
  const result = await db.query("DELETE FROM care_requests WHERE id = $1", [id]);
  return result.rowCount > 0;
}

async function listCareRequestServices(careRequestId) {
  const result = await db.query(
    `SELECT s.id AS service_id, s.name, s.description, crs.confidence_score, crs.source
     FROM care_request_services crs
     JOIN services s ON s.id = crs.service_id
     WHERE crs.care_request_id = $1
     ORDER BY s.name`,
    [careRequestId]
  );
  return result.rows;
}

async function addCareRequestService(careRequestId, data) {
  await db.query(
    `INSERT INTO care_request_services (care_request_id, service_id, confidence_score, source)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (care_request_id, service_id) DO UPDATE SET
       confidence_score = EXCLUDED.confidence_score,
       source = EXCLUDED.source`,
    [
      careRequestId,
      data.serviceId,
      data.confidenceScore ?? null,
      data.source || "user",
    ]
  );
  return listCareRequestServices(careRequestId);
}

async function removeCareRequestService(careRequestId, serviceId) {
  const result = await db.query(
    `DELETE FROM care_request_services WHERE care_request_id = $1 AND service_id = $2`,
    [careRequestId, serviceId]
  );
  return result.rowCount > 0;
}

async function getAiAnalysis(careRequestId) {
  const result = await db.query(
    `SELECT id, care_request_id, structured_data, generated_summary, urgency, disclaimer, created_at
     FROM ai_request_analysis
     WHERE care_request_id = $1`,
    [careRequestId]
  );
  return result.rows[0] || null;
}

/**
 * Create or update the AI analysis for a care request.
 */
async function upsertAiAnalysis(careRequestId, data) {
  const current = await getAiAnalysis(careRequestId);
  if (current) {
    await db.query(
      `UPDATE ai_request_analysis
       SET structured_data = $1, generated_summary = $2, urgency = $3, disclaimer = $4
       WHERE care_request_id = $5`,
      [
        data.structuredData ? JSON.stringify(data.structuredData) : null,
        data.generatedSummary ?? null,
        data.urgency ?? null,
        data.disclaimer ?? null,
        careRequestId,
      ]
    );
  } else {
    await db.query(
      `INSERT INTO ai_request_analysis (care_request_id, structured_data, generated_summary, urgency, disclaimer)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        careRequestId,
        data.structuredData ? JSON.stringify(data.structuredData) : null,
        data.generatedSummary ?? null,
        data.urgency ?? null,
        data.disclaimer ?? null,
      ]
    );
  }
  return getAiAnalysis(careRequestId);
}

/**
 * Provider request management.
 */
async function listProviderRequests({ careRequestId, providerId, status } = {}) {
  const conditions = [];
  const params = [];
  let i = 1;

  if (careRequestId) {
    conditions.push(`pr.care_request_id = $${i++}`);
    params.push(careRequestId);
  }
  if (providerId) {
    conditions.push(`pr.provider_id = $${i++}`);
    params.push(providerId);
  }
  if (status) {
    conditions.push(`pr.status = $${i++}`);
    params.push(status);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const result = await db.query(
    `SELECT pr.id, pr.care_request_id, pr.provider_id, pr.status, pr.response_message,
            pr.created_at, pr.updated_at,
            cr.description AS care_request_description, cr.urgency
     FROM provider_requests pr
     JOIN care_requests cr ON cr.id = pr.care_request_id
     ${whereClause}
     ORDER BY pr.created_at DESC`,
    params
  );
  return result.rows;
}

async function createProviderRequest(careRequestId, providerId) {
  const result = await db.query(
    `INSERT INTO provider_requests (care_request_id, provider_id, status)
     VALUES ($1, $2, 'pending')
     ON CONFLICT (care_request_id, provider_id) DO NOTHING
     RETURNING *`,
    [careRequestId, providerId]
  );
  return result.rows[0] || null;
}

async function respondToProviderRequest(providerRequestId, providerId, data) {
  const result = await db.query(
    `UPDATE provider_requests
     SET status = $1, response_message = $2, updated_at = NOW()
     WHERE id = $3 AND provider_id = $4
     RETURNING *`,
    [data.status, data.responseMessage ?? null, providerRequestId, providerId]
  );
  return result.rows[0] || null;
}

async function updateProviderRequestStatus(providerRequestId, status) {
  const result = await db.query(
    `UPDATE provider_requests
     SET status = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING *`,
    [status, providerRequestId]
  );
  return result.rows[0] || null;
}

async function getProviderRequest(id) {
  const result = await db.query(
    `SELECT pr.*, cr.description AS care_request_description, cr.urgency
     FROM provider_requests pr
     JOIN care_requests cr ON cr.id = pr.care_request_id
     WHERE pr.id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

module.exports = {
  listCareRequests,
  getCareRequest,
  createCareRequest,
  updateCareRequest,
  deleteCareRequest,
  listCareRequestServices,
  addCareRequestService,
  removeCareRequestService,
  getAiAnalysis,
  upsertAiAnalysis,
  listProviderRequests,
  createProviderRequest,
  respondToProviderRequest,
  updateProviderRequestStatus,
  getProviderRequest,
};
