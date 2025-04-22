const express = require("express");
const router = express.Router();
const requireAuth = require("../middlewares/requireAuth");

const {
	getFavorites,
	addFavorite,
	removeFavorite,
} = require("../controllers/favoriteController");

router.get("/", requireAuth, getFavorites);
router.post("/:id", requireAuth, addFavorite);
router.delete("/:id", requireAuth, removeFavorite);

module.exports = router;
