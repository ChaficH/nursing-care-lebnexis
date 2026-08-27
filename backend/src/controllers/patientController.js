const service = require("../services/patientService");

async function listPatients(req, res) {
  // Admins see all; providers/proxies can see the subset they manage.
  if (req.user.role === "admin") {
    const patients = await service.listPatients();
    return res.json({ patients });
  }
  // A proxy (patient or provider) sees only patients they manage.
  const patients = await service.listManagedPatients(req.user.id);
  return res.json({ patients });
}

async function getPatient(req, res) {
  const patient = await service.getPatientById(req.params.id);
  if (!patient) {
    return res.status(404).json({ error: "Patient not found" });
  }
  return res.json({ patient });
}

async function getMyPatientProfile(req, res) {
  const patient = await service.getPatientByUserId(req.user.id);
  if (!patient) {
    return res.status(404).json({ error: "Patient profile not found" });
  }
  return res.json({ patient });
}

async function createPatient(req, res) {
  if (!req.body.userId) {
    return res.status(400).json({ error: "userId is required" });
  }
  const patient = await service.createPatient(req.body);
  return res.status(201).json({ patient });
}

async function updatePatient(req, res) {
  const patient = await service.updatePatient(req.params.id, req.body);
  if (!patient) {
    return res.status(404).json({ error: "Patient not found" });
  }
  return res.json({ patient });
}

async function deletePatient(req, res) {
  const ok = await service.deletePatient(req.params.id);
  if (!ok) {
    return res.status(404).json({ error: "Patient not found" });
  }
  return res.status(204).send();
}

module.exports = {
  listPatients,
  getPatient,
  getMyPatientProfile,
  createPatient,
  updatePatient,
  deletePatient,
};
