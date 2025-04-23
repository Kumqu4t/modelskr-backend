const express = require("express");
const router = express.Router();
const requireAdmin = require("../middlewares/requireAdmin");

const {
	getRandomPhotographers,
	getAllPhotographers,
	getPhotographerById,
	createPhotographer,
	updatePhotographer,
	deletePhotographer,
} = require("../controllers/photographerController");

router.get("/random", getRandomPhotographers);
router.get("/", getAllPhotographers);
router.get("/:id", getPhotographerById);
router.post("/", requireAdmin, createPhotographer);
router.patch("/:id", requireAdmin, updatePhotographer);
router.delete("/:id", requireAdmin, deletePhotographer);

module.exports = router;
