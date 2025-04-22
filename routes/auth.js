const express = require("express");
const router = express.Router();
const {
	googleLogin,
	getCurrentUser,
} = require("../controllers/authController");
const requireAuth = require("../middlewares/requireAuth");

router.get("/me", requireAuth, getCurrentUser);
router.post("/google", googleLogin);

module.exports = router;
