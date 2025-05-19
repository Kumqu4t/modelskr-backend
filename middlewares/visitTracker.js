const redis = require("../config/redis");

const trackVisit = async (req, res, next) => {
	const today = new Date().toISOString().split("T")[0];
	const ip = req.ip || req.connection.remoteAddress;
	const visitKey = `visited:${today}:${ip}`;
	const counterKey = `visits:${today}`;

	const alreadyVisited = await redis.get(visitKey);

	if (!alreadyVisited) {
		await redis.incr(counterKey); // 방문자 수 증가
		await redis.set(visitKey, "1", "EX", 86400); // IP 기록 (24시간 유지)
	}

	next();
};

module.exports = trackVisit;
