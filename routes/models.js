const express = require("express");
const router = express.Router();
const requireAdmin = require("../middlewares/requireAdmin");

const {
	getRandomModels,
	getAllModels,
	getModelById,
	createModel,
	updateModel,
	deleteModel,
} = require("../controllers/modelController");

router.get("/random", getRandomModels);
router.get("/", getAllModels);
router.get("/:id", getModelById);
router.post("/", requireAdmin, createModel);
router.patch("/:id", requireAdmin, updateModel);
router.delete("/:id", requireAdmin, deleteModel);

module.exports = router;
