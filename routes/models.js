const express = require("express");
const router = express.Router();

const {
	getAllModels,
	getRandomModels,
	getModelById,
	createModel,
	updateModel,
	deleteModel,
} = require("../controllers/modelController");

router.get("/", getAllModels);
router.get("/random", getRandomModels);
router.get("/:id", getModelById);
router.post("/", createModel);
router.patch("/:id", updateModel);
router.delete("/:id", deleteModel);

module.exports = router;
