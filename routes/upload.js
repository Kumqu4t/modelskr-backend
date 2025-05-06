const express = require("express");
const upload = require("../middlewares/upload.js");
const { uploadImage } = require("../controllers/uploadController.js");

const router = express.Router();

router.post("/", upload.single("image"), uploadImage);

module.exports = router;
