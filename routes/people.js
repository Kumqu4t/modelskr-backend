const express = require("express");
const router = express.Router();
const requireAdmin = require("../middlewares/requireAdmin");

const {
	getRandomPeople,
	getAllPeople,
	getPersonById,
	createPerson,
	updatePerson,
	deletePerson,
} = require("../controllers/personController");

router.get("/random", getRandomPeople);
router.get("/", getAllPeople);
router.get("/:id", getPersonById);
router.post("/", requireAdmin, createPerson);
router.patch("/:id", requireAdmin, updatePerson);
router.delete("/:id", requireAdmin, deletePerson);

module.exports = router;
