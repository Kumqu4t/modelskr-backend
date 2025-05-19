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

const getTodayVisitCount = async (req, res) => {
	try {
		const today = new Date().toISOString().split("T")[0];
		const count = await redis.get(`visits:${today}`);
		res.status(200).json({ date: today, count: parseInt(count) || 0 });
	} catch (err) {
		console.error("방문자 수 조회 실패:", err);
		res.status(500).json({ message: "방문자 수 조회 실패" });
	}
};

const getRecentVisitCounts = async (req, res) => {
	try {
		const days = Array.from({ length: 7 }, (_, i) => {
			const date = new Date();
			date.setDate(date.getDate() - (6 - i));
			return date.toISOString().split("T")[0];
		});

		const keys = days.map((day) => `visits:${day}`);
		const counts = await Promise.all(keys.map((key) => redis.get(key)));

		const results = days.map((day, idx) => ({
			date: day,
			count: parseInt(counts[idx]) || 0,
		}));

		res.status(200).json(results);
	} catch (err) {
		console.error("최근 방문자 수 조회 실패:", err);
		res.status(500).json({ message: "최근 방문자 수 조회 실패" });
	}
};

module.exports = {
	clearCache,
	getAllUsers,
	getTodayVisitCount,
	getRecentVisitCounts,
};
