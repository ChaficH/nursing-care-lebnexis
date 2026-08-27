const router = require("express").Router();
const controller = require("../controllers/patientController");
const asyncHandler = require("../middleware/asyncHandler");
const { authenticate, authorize } = require("../middleware/auth");

// GET /api/patients
router.get("/", authenticate, asyncHandler(controller.listPatients));

// POST /api/patients
router.post("/", authenticate, authorize("admin", "provider", "patient"), asyncHandler(controller.createPatient));

// GET /api/patients/me
router.get("/me", authenticate, asyncHandler(controller.getMyPatientProfile));

// GET /api/patients/:id
router.get("/:id", authenticate, asyncHandler(controller.getPatient));

// PATCH /api/patients/:id
router.patch("/:id", authenticate, authorize("admin", "provider", "patient"), asyncHandler(controller.updatePatient));

// DELETE /api/patients/:id
router.delete("/:id", authenticate, authorize("admin"), asyncHandler(controller.deletePatient));

module.exports = router;
