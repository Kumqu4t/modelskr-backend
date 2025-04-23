const express = require("express");
const router = express.Router();
const {
	createPhoto,
	getAllPhotos,
	getPhotoById,
	updatePhoto,
	deletePhoto,
} = require("../controllers/photoController");
const requireAdmin = require("../middlewares/requireAdmin");

router.post("/", requireAdmin, createPhoto);
router.get("/", getAllPhotos);
router.get("/:id", getPhotoById);
router.patch("/:id", requireAdmin, updatePhoto);
router.delete("/:id", requireAdmin, deletePhoto);

// for test
// router.post("/", createPhoto);
// router.patch("/:id", updatePhoto);
// router.delete("/:id", deletePhoto);

module.exports = router;
