const router = require("express").Router();
const controller = require("../controllers/appointmentController");
const asyncHandler = require("../middleware/asyncHandler");
const { authenticate, authorize } = require("../middleware/auth");

// GET /api/reviews?providerId=&patientId=
router.get("/", authenticate, asyncHandler(controller.listReviews));

// POST /api/reviews
router.post("/", authenticate, authorize("patient", "admin"), asyncHandler(controller.createReview));

// GET /api/reviews/:id
router.get("/:id", authenticate, asyncHandler(controller.getReview));

module.exports = router;
