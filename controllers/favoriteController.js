const User = require("../models/User");

exports.addFavorite = async (req, res) => {
	try {
		const user = req.user;
		const modelId = req.params.id;

		if (!user.favorites.includes(modelId)) {
			user.favorites.push(modelId);
			await user.save();
		}

		res.status(200).json({ message: "즐겨찾기에 추가되었습니다." });
	} catch (err) {
		console.error("즐겨찾기 추가 실패:", err);
		res.status(500).json({ message: "서버 오류" });
	}
};

exports.removeFavorite = async (req, res) => {
	try {
		const user = req.user;
		const modelId = req.params.id;

		user.favorites = user.favorites.filter(
			(id) => id.toString() !== modelId.toString()
		);
		await user.save();

		res.status(200).json({ message: "즐겨찾기에서 제거되었습니다." });
	} catch (err) {
		console.error("즐겨찾기 제거 실패:", err);
		res.status(500).json({ message: "서버 오류" });
	}
};

exports.getFavorites = async (req, res) => {
	try {
		const user = await User.findById(req.user._id).populate("favorites");
		res.status(200).json(user.favorites);
	} catch (err) {
		console.error("즐겨찾기 조회 실패:", err);
		res.status(500).json({ message: "서버 오류" });
	}
};
