const mongoose = require("mongoose");
const User = require("../models/User");
require("../models/Model");
require("../models/Photographer");
require("../models/Photo");

const addFavorite = async (req, res) => {
	try {
		const user = req.user;
		const { id, kind } = req.body;

		if (!id || !kind) {
			return res
				.status(400)
				.json({ message: "ID 또는 kind가 누락되었습니다." });
		}

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ message: "유효하지 않은 ID입니다." });
		}

		const objectId = new mongoose.Types.ObjectId(id);

		const exists = user.favorites.some(
			(fav) => fav.item?.toString() === objectId.toString() && fav.kind === kind
		);

		if (!exists) {
			user.favorites.push({ item: objectId, kind });
			console.log("추가될 즐겨찾기:", { item: objectId, kind });
			await user.save();
			console.log("저장 후 즐겨찾기 목록:", user.favorites);
		} else {
			console.log("이미 존재하는 즐겨찾기입니다.");
		}

		res.status(200).json({ message: "즐겨찾기에 추가되었습니다." });
	} catch (err) {
		console.error("즐겨찾기 추가 실패:", err);
		res.status(500).json({ message: "서버 오류" });
	}
};

const removeFavorite = async (req, res) => {
	try {
		const user = req.user;
		const { id, kind } = req.body;

		user.favorites = user.favorites.filter(
			(fav) => !(fav.item.toString() === id && fav.kind === kind)
		);
		await user.save();

		res.status(200).json({ message: "즐겨찾기에서 제거되었습니다." });
	} catch (err) {
		console.error("즐겨찾기 제거 실패:", err);
		res.status(500).json({ message: "서버 오류" });
	}
};

const getFavorites = async (req, res) => {
	try {
		const user = await User.findById(req.user._id).lean();
		const kind = req.query.kind;
		const kinds = kind === "all" ? ["Model", "Photographer", "Photo"] : [kind];

		let allFavorites = [];

		for (const k of kinds) {
			const kindFavorites = user.favorites.filter((fav) => fav.kind === k);

			const ids = kindFavorites.map((fav) => fav.item);

			let Model;
			if (k === "Model") Model = require("../models/Model");
			if (k === "Photographer") Model = require("../models/Photographer");
			if (k === "Photo") Model = require("../models/Photo");

			const items = await Model.find({ _id: { $in: ids } }).lean();

			const favorites = kindFavorites
				.map((fav) => {
					const item = items.find(
						(i) => i._id.toString() === fav.item.toString()
					);
					return item ? { ...fav, item } : null;
				})
				.filter(Boolean);

			allFavorites = allFavorites.concat(favorites);
		}

		console.log("불러온 즐겨찾기 목록: ", allFavorites);
		res.status(200).json(allFavorites);
	} catch (err) {
		console.error("즐겨찾기 조회 실패:", err);
		res.status(500).json({ message: "서버 오류" });
	}
};

module.exports = {
	addFavorite,
	removeFavorite,
	getFavorites,
};
