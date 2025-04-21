const express = require("express");
const router = express.Router();

const {
	getAllAgencies,
	getAgencyById,
	createAgency,
	updateAgency,
	deleteAgency,
} = require("../controllers/agencyController");

router.get("/", getAllAgencies);
router.get("/:id", getAgencyById);
router.post("/", createAgency);
router.patch("/:id", updateAgency);
router.delete("/:id", deleteAgency);

module.exports = router;
