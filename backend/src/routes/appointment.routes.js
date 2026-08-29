const router = require("express").Router();
const controller = require("../controllers/appointmentController");
const asyncHandler = require("../middleware/asyncHandler");
const { authenticate, authorize } = require("../middleware/auth");

// GET /api/appointments
router.get("/", authenticate, asyncHandler(controller.listAppointments));

// POST /api/appointments
router.post("/", authenticate, authorize("patient", "provider", "admin"), asyncHandler(controller.scheduleAppointment));

// GET /api/appointments/:id
router.get("/:id", authenticate, asyncHandler(controller.getAppointment));

// PATCH /api/appointments/:id
router.patch("/:id", authenticate, authorize("patient", "provider", "admin"), asyncHandler(controller.updateAppointment));

// POST /api/appointments/:id/cancel
router.post("/:id/cancel", authenticate, authorize("patient", "provider", "admin"), asyncHandler(controller.cancelAppointment));

// POST /api/appointments/:id/complete
router.post("/:id/complete", authenticate, authorize("provider", "admin"), asyncHandler(controller.completeAppointment));

// DELETE /api/appointments/:id
router.delete("/:id", authenticate, authorize("admin"), asyncHandler(controller.deleteAppointment));

// GET /api/appointments/:id/review
router.get("/:id/review", authenticate, asyncHandler(controller.getAppointmentReview));

module.exports = router;
