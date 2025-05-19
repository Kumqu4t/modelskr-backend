const express = require("express");
const router = express.Router();
const requireAdmin = require("../middlewares/requireAdmin");

const { clearCache, getAllUsers } = require("../controllers/adminController");

router.post("/clear-cache", requireAdmin, clearCache);
router.get("/getAllUsers", requireAdmin, getAllUsers);

module.exports = router;
