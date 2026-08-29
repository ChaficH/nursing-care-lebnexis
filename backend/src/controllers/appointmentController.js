const service = require("../services/appointmentService");

async function listAppointments(req, res) {
  const filters = { ...req.query };
  const { getPatientByUserId } = require("../services/patientService");
  const { getProviderByUserId } = require("../services/providerService");

  if (req.user.role === "patient") {
    const pat = await getPatientByUserId(req.user.id);
    if (pat) filters.patientId = pat.id;
    else return res.json({ appointments: [] });
  } else if (req.user.role === "provider") {
    const prov = await getProviderByUserId(req.user.id);
    if (prov) filters.providerId = prov.id;
    else return res.json({ appointments: [] });
  }

  const appointments = await service.listAppointments(filters);
  return res.json({ appointments });
}

async function getAppointment(req, res) {
  const appointment = await service.getAppointment(req.params.id);
  if (!appointment) {
    return res.status(404).json({ error: "Appointment not found" });
  }
  return res.json({ appointment });
}

async function scheduleAppointment(req, res) {
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
  const appointment = await service.scheduleAppointment(req.body);
  return res.status(201).json({ appointment });
}

async function updateAppointment(req, res) {
  const appointment = await service.updateAppointment(req.params.id, req.body);
  if (!appointment) {
    return res.status(404).json({ error: "Appointment not found" });
  }
  return res.json({ appointment });
}

async function cancelAppointment(req, res) {
  const appointment = await service.updateAppointment(req.params.id, {
    status: "cancelled",
  });
  if (!appointment) {
    return res.status(404).json({ error: "Appointment not found" });
  }
  return res.json({ appointment });
}

async function completeAppointment(req, res) {
  const appointment = await service.updateAppointment(req.params.id, {
    status: "completed",
  });
  if (!appointment) {
    return res.status(404).json({ error: "Appointment not found" });
  }
  return res.json({ appointment });
}

async function deleteAppointment(req, res) {
  const ok = await service.deleteAppointment(req.params.id);
  if (!ok) {
    return res.status(404).json({ error: "Appointment not found" });
  }
  return res.status(204).send();
}

/* ---------------- reviews ---------------- */

async function listReviews(req, res) {
  const reviews = await service.listReviews(req.query);
  return res.json({ reviews });
}

async function getReview(req, res) {
  const review = await service.getReview(req.params.id);
  if (!review) {
    return res.status(404).json({ error: "Review not found" });
  }
  return res.json({ review });
}

async function getAppointmentReview(req, res) {
  const { listReviews } = require("../services/appointmentService");
  const reviews = await listReviews({ appointmentId: req.params.id });
  return res.json({ reviews });
}

async function createReview(req, res) {
  const { getPatientByUserId } = require("../services/patientService");
  if (req.user.role === "patient") {
    const pat = await getPatientByUserId(req.user.id);
    if (!pat) {
      return res.status(404).json({ error: "Patient profile not found" });
    }
    req.body.patientId = pat.id;
  }
  if (!req.body.appointmentId) {
    return res.status(400).json({ error: "appointmentId is required" });
  }
  const review = await service.createReview(req.body);
  return res.status(201).json({ review });
}

module.exports = {
  listAppointments,
  getAppointment,
  scheduleAppointment,
  updateAppointment,
  cancelAppointment,
  completeAppointment,
  deleteAppointment,
  listReviews,
  getReview,
  getAppointmentReview,
  createReview,
};
