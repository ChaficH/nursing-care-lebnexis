const service = require("../services/careRequestService");

/**
 * Patients see their own requests; providers see requests they've been
 * assigned to (via provider_requests); admins see everything.
 */
async function listCareRequests(req, res) {
  const filters = { ...req.query };

  if (req.user.role === "patient") {
    // Only the patient's own requests (match patient by user_id).
    const { getPatientByUserId } = require("../services/patientService");
    const pat = await getPatientByUserId(req.user.id);
    if (pat) filters.patientId = pat.id;
    else return res.json({ careRequests: [] });
  } else if (req.user.role === "provider") {
    // Show requests assigned to this provider (via provider_requests).
    const { getProviderByUserId } = require("../services/providerService");
    const prov = await getProviderByUserId(req.user.id);
    const providerRequests = prov
      ? await service.listProviderRequests({ providerId: prov.id, ...filters })
      : [];
    return res.json({
      careRequests: providerRequests.map((p) => ({
        providerRequestId: p.id,
        providerRequestStatus: p.status,
        id: p.care_request_id,
        description: p.care_request_description,
        urgency: p.urgency,
      })),
    });
  }

  const careRequests = await service.listCareRequests(filters);
  return res.json({ careRequests });
}

async function getCareRequest(req, res) {
  const careRequest = await service.getCareRequest(req.params.id);
  if (!careRequest) {
    return res.status(404).json({ error: "Care request not found" });
  }
  return res.json({ careRequest });
}

async function createCareRequest(req, res) {
  const { getPatientByUserId } = require("../services/patientService");
  if (req.user.role === "patient") {
    const pat = await getPatientByUserId(req.user.id);
    if (!pat) {
      return res.status(404).json({ error: "Patient profile not found" });
    }
    req.body.patientId = pat.id;
  }
  if (!req.body.patientId) {
    return res.status(400).json({ error: "patientId is required" });
  }
  if (!req.body.description) {
    return res.status(400).json({ error: "description is required" });
  }
  const careRequest = await service.createCareRequest(req.body);
  return res.status(201).json({ careRequest });
}

async function updateCareRequest(req, res) {
  const careRequest = await service.updateCareRequest(req.params.id, req.body);
  if (!careRequest) {
    return res.status(404).json({ error: "Care request not found" });
  }
  return res.json({ careRequest });
}

async function deleteCareRequest(req, res) {
  const ok = await service.deleteCareRequest(req.params.id);
  if (!ok) {
    return res.status(404).json({ error: "Care request not found" });
  }
  return res.status(204).send();
}

async function getCareRequestServices(req, res) {
  const careRequest = await service.getCareRequest(req.params.id);
  if (!careRequest) {
    return res.status(404).json({ error: "Care request not found" });
  }
  return res.json({ services: careRequest.services });
}

async function addService(req, res) {
  const services = await service.addCareRequestService(req.params.id, req.body);
  return res.status(201).json({ services });
}

async function removeService(req, res) {
  const ok = await service.removeCareRequestService(
    req.params.id,
    req.params.serviceId
  );
  if (!ok) {
    return res.status(404).json({ error: "Service link not found" });
  }
  return res.status(204).send();
}

async function getAiAnalysis(req, res) {
  const analysis = await service.getAiAnalysis(req.params.id);
  if (!analysis) {
    return res.status(404).json({ error: "AI analysis not found" });
  }
  return res.json({ analysis });
}

async function upsertAiAnalysis(req, res) {
  const careRequest = await service.getCareRequest(req.params.id);
  if (!careRequest) {
    return res.status(404).json({ error: "Care request not found" });
  }
  const analysis = await service.upsertAiAnalysis(req.params.id, req.body);
  return res.json({ analysis });
}

/* ---------------- provider_requests ---------------- */

async function listProviderRequests(req, res) {
  const filters = { ...req.query };
  const { getProviderByUserId } = require("../services/providerService");
  const prov = await getProviderByUserId(req.user.id);
  if (req.user.role === "provider" && prov) filters.providerId = prov.id;
  const requests = await service.listProviderRequests(filters);
  return res.json({ requests });
}

async function createProviderRequest(req, res) {
  if (!req.body.providerId) {
    return res.status(400).json({ error: "providerId is required" });
  }
  const request = await service.createProviderRequest(
    req.params.id,
    req.body.providerId
  );
  return res.status(201).json({ request });
}

async function respondToProviderRequest(req, res) {
  const { getProviderByUserId } = require("../services/providerService");
  const prov = await getProviderByUserId(req.user.id);
  if (!prov) {
    return res.status(404).json({ error: "Provider profile not found" });
  }
  if (!["accepted", "rejected"].includes(req.body.status)) {
    return res.status(400).json({ error: "status must be accepted or rejected" });
  }
  const request = await service.respondToProviderRequest(
    req.params.requestId,
    prov.id,
    req.body
  );
  if (!request) {
    return res.status(404).json({ error: "Provider request not found" });
  }
  return res.json({ request });
}

async function updateProviderRequestStatus(req, res) {
  if (!["accepted", "rejected", "cancelled", "completed"].includes(req.body.status)) {
    return res
      .status(400)
      .json({ error: "status must be accepted, rejected, cancelled or completed" });
  }
  const request = await service.updateProviderRequestStatus(
    req.params.requestId,
    req.body.status
  );
  if (!request) {
    return res.status(404).json({ error: "Provider request not found" });
  }
  return res.json({ request });
}

async function getProviderRequest(req, res) {
  const request = await service.getProviderRequest(req.params.requestId);
  if (!request) {
    return res.status(404).json({ error: "Provider request not found" });
  }
  return res.json({ request });
}

module.exports = {
  listCareRequests,
  getCareRequest,
  createCareRequest,
  updateCareRequest,
  deleteCareRequest,
  getCareRequestServices,
  addService,
  removeService,
  getAiAnalysis,
  upsertAiAnalysis,
  listProviderRequests,
  createProviderRequest,
  respondToProviderRequest,
  updateProviderRequestStatus,
  getProviderRequest,
};
