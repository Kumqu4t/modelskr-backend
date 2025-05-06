const express = require("express");
const upload = require("../middlewares/upload.js");
const {
	uploadImage,
	removeImage,
} = require("../controllers/uploadController.js");

const router = express.Router();

router.post("/", upload.single("image"), uploadImage);
router.post("/remove", removeImage);

module.exports = router;
