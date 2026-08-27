const service = require("../services/providerService");

async function listProviders(req, res) {
  const providers = await service.listProviders(req.query);
  return res.json({ providers });
}

async function getProvider(req, res) {
  const provider = await service.getProviderById(req.params.id);
  if (!provider) {
    return res.status(404).json({ error: "Provider not found" });
  }
  return res.json({ provider });
}

async function getMyProvider(req, res) {
  const provider = await service.getProviderByUserId(req.user.id);
  if (!provider) {
    return res.status(404).json({ error: "Provider profile not found" });
  }
  return res.json({ provider });
}

async function updateProvider(req, res) {
  const provider = await service.updateProvider(req.params.id, req.body);
  if (!provider) {
    return res.status(404).json({ error: "Provider not found" });
  }
  return res.json({ provider });
}

async function updateProviderStatus(req, res) {
  const provider = await service.updateProviderStatus(
    req.params.id,
    req.body.status
  );
  if (!provider) {
    return res.status(404).json({ error: "Provider not found" });
  }
  return res.json({ provider });
}

async function getServices(req, res) {
  const services = await service.listServices();
  return res.json({ services });
}

async function getProviderServices(req, res) {
  const services = await service.listProviderServices(req.params.id);
  return res.json({ services });
}

async function assignService(req, res) {
  const { serviceId } = req.body;
  if (!serviceId) {
    return res.status(400).json({ error: "serviceId is required" });
  }
  const services = await service.assignService(req.params.id, serviceId);
  return res.status(201).json({ services });
}

async function removeService(req, res) {
  const ok = await service.removeService(req.params.id, req.params.serviceId);
  if (!ok) {
    return res.status(404).json({ error: "Service assignment not found" });
  }
  return res.status(204).send();
}

async function getAvailability(req, res) {
  const slots = await service.listAvailability(req.params.id);
  return res.json({ slots });
}

async function setAvailability(req, res) {
  const { slots } = req.body;
  if (!Array.isArray(slots)) {
    return res.status(400).json({ error: "slots must be an array" });
  }
  await service.setAvailability(req.params.id, slots);
  const updated = await service.listAvailability(req.params.id);
  return res.json({ slots: updated });
}

async function addAvailabilitySlot(req, res) {
  const slot = await service.addAvailabilitySlot(req.params.id, req.body);
  return res.status(201).json({ slot });
}

async function deleteAvailabilitySlot(req, res) {
  const ok = await service.deleteAvailabilitySlot(
    req.params.id,
    req.params.slotId
  );
  if (!ok) {
    return res.status(404).json({ error: "Slot not found" });
  }
  return res.status(204).send();
}

module.exports = {
  listProviders,
  getProvider,
  getMyProvider,
  updateProvider,
  updateProviderStatus,
  getServices,
  getProviderServices,
  assignService,
  removeService,
  getAvailability,
  setAvailability,
  addAvailabilitySlot,
  deleteAvailabilitySlot,
};
