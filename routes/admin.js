const express = require("express");
const router = express.Router();
const requireAdmin = require("../middlewares/requireAdmin");

const { clearCache } = require("../controllers/adminController");

router.post("/clear-cache", requireAdmin, clearCache);

module.exports = router;
