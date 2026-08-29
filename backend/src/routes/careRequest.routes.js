const router = require("express").Router();
const controller = require("../controllers/careRequestController");
const asyncHandler = require("../middleware/asyncHandler");
const { authenticate, authorize } = require("../middleware/auth");

// GET /api/care-requests
router.get("/", authenticate, asyncHandler(controller.listCareRequests));

// POST /api/care-requests
router.post("/", authenticate, authorize("patient", "provider", "admin"), asyncHandler(controller.createCareRequest));

// GET /api/care-requests/provider-requests  (all provider requests)
router.get("/provider-requests", authenticate, asyncHandler(controller.listProviderRequests));

// GET /api/care-requests/:id
router.get("/:id", authenticate, asyncHandler(controller.getCareRequest));

// PATCH /api/care-requests/:id
router.patch("/:id", authenticate, authorize("patient", "admin"), asyncHandler(controller.updateCareRequest));

// DELETE /api/care-requests/:id
router.delete("/:id", authenticate, authorize("patient", "admin"), asyncHandler(controller.deleteCareRequest));

// GET /api/care-requests/:id/services
router.get("/:id/services", authenticate, asyncHandler(controller.getCareRequestServices));

// POST /api/care-requests/:id/services
router.post("/:id/services", authenticate, authorize("patient", "admin"), asyncHandler(controller.addService));

// DELETE /api/care-requests/:id/services/:serviceId
router.delete("/:id/services/:serviceId", authenticate, authorize("patient", "admin"), asyncHandler(controller.removeService));

// GET /api/care-requests/:id/ai
router.get("/:id/ai", authenticate, asyncHandler(controller.getAiAnalysis));

// PUT /api/care-requests/:id/ai
router.put("/:id/ai", authenticate, authorize("admin"), asyncHandler(controller.upsertAiAnalysis));

// POST /api/care-requests/:id/provider-requests
router.post("/:id/provider-requests", authenticate, authorize("admin"), asyncHandler(controller.createProviderRequest));

// GET /api/care-requests/:id/provider-requests
router.get("/:id/provider-requests", authenticate, asyncHandler(controller.listProviderRequests));

// GET /api/care-requests/:id/provider-requests/:requestId
router.get("/:id/provider-requests/:requestId", authenticate, asyncHandler(controller.getProviderRequest));

// POST /api/care-requests/:id/provider-requests/:requestId/respond
router.post("/:id/provider-requests/:requestId/respond", authenticate, authorize("provider"), asyncHandler(controller.respondToProviderRequest));

// PATCH /api/care-requests/:id/provider-requests/:requestId
router.patch("/:id/provider-requests/:requestId", authenticate, authorize("admin", "provider"), asyncHandler(controller.updateProviderRequestStatus));

module.exports = router;
