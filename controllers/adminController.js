const redis = require("../config/redis");

const clearCache = async (req, res) => {
	try {
		await redis.flushall();
		res.status(200).json({ message: "Redis cache cleared" });
	} catch (err) {
		console.error("Redis 초기화 실패:", err);
		res.status(500).json({ message: "Redis 초기화 실패" });
	}
};

module.exports = { clearCache };
