const express = require("express");
const router = express.Router();
const requireAdmin = require("../middlewares/requireAdmin");

const {
	clearCache,
	getAllUsers,
	getTodayVisitCount,
	getRecentVisitCounts,
} = require("../controllers/adminController");

router.post("/clear-cache", requireAdmin, clearCache);
router.get("/getAllUsers", requireAdmin, getAllUsers);
router.get("/visits/today", getTodayVisitCount);
router.get("/visits/recent", getRecentVisitCounts);

module.exports = router;
