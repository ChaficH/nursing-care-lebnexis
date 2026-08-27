const router = require("express").Router();
const controller = require("../controllers/providerController");
const asyncHandler = require("../middleware/asyncHandler");
const { authenticate, authorize } = require("../middleware/auth");

// GET /api/providers
router.get("/", authenticate, asyncHandler(controller.listProviders));

// GET /api/providers/services
router.get("/services", authenticate, asyncHandler(controller.getServices));

// GET /api/providers/me
router.get("/me", authenticate, authorize("provider"), asyncHandler(controller.getMyProvider));

// GET /api/providers/:id
router.get("/:id", authenticate, asyncHandler(controller.getProvider));

// PATCH /api/providers/:id  (provider updates own profile; admin can too)
router.patch("/:id", authenticate, authorize("provider", "admin"), asyncHandler(controller.updateProvider));

// PATCH /api/providers/:id/status  (admin only)
router.patch("/:id/status", authenticate, authorize("admin"), asyncHandler(controller.updateProviderStatus));

// GET /api/providers/:id/services
router.get("/:id/services", authenticate, asyncHandler(controller.getProviderServices));

// POST /api/providers/:id/services
router.post("/:id/services", authenticate, authorize("provider", "admin"), asyncHandler(controller.assignService));

// DELETE /api/providers/:id/services/:serviceId
router.delete("/:id/services/:serviceId", authenticate, authorize("provider", "admin"), asyncHandler(controller.removeService));

// GET /api/providers/:id/availability
router.get("/:id/availability", authenticate, asyncHandler(controller.getAvailability));

// PUT /api/providers/:id/availability  (replace all slots)
router.put("/:id/availability", authenticate, authorize("provider", "admin"), asyncHandler(controller.setAvailability));

// POST /api/providers/:id/availability  (add one slot)
router.post("/:id/availability", authenticate, authorize("provider", "admin"), asyncHandler(controller.addAvailabilitySlot));

// DELETE /api/providers/:id/availability/:slotId
router.delete("/:id/availability/:slotId", authenticate, authorize("provider", "admin"), asyncHandler(controller.deleteAvailabilitySlot));

module.exports = router;
