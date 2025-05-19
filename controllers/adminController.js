const redis = require("../config/redis");
const User = require("../models/User");

const clearCache = async (req, res) => {
	try {
		await redis.flushall();
		res.status(200).json({ message: "Redis cache cleared" });
	} catch (err) {
		console.error("Redis 초기화 실패:", err);
		res.status(500).json({ message: "Redis 초기화 실패" });
	}
};

const getAllUsers = async (req, res) => {
	try {
		const { fields } = req.query;
		const selectFields = fields ? fields.split(",").join(" ") : null;
		const users = await User.find().select(selectFields);
		res.status(200).json(users);
	} catch (err) {
		console.error("유저 목록 조회 실패:", err);
		res.status(500).json({ message: "유저 목록 조회 실패" });
	}
};

module.exports = { clearCache, getAllUsers };
