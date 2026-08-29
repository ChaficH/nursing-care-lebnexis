const router = require("express").Router();
const controller = require("../controllers/authController");
const asyncHandler = require("../middleware/asyncHandler");
const { authenticate } = require("../middleware/auth");

// POST /api/auth/register
router.post("/register", asyncHandler(controller.register));

// POST /api/auth/login
router.post("/login", asyncHandler(controller.login));

// GET /api/auth/me
router.get("/me", authenticate, asyncHandler(controller.me));

module.exports = router;
