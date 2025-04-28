const express = require("express");
const router = express.Router();
const requireAdmin = require("../middlewares/requireAdmin");

const {
	getAllAgencies,
	getAgencyById,
	createAgency,
	updateAgency,
	deleteAgency,
} = require("../controllers/agencyController");

router.get("/", getAllAgencies);
router.get("/:id", getAgencyById);
router.post("/", requireAdmin, createAgency);
router.patch("/:id", requireAdmin, updateAgency);
router.delete("/:id", requireAdmin, deleteAgency);

module.exports = router;
