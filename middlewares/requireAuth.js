const jwt = require("jsonwebtoken");
const User = require("../models/User");

const requireAuth = async (req, res, next) => {
	try {
		const authHeader = req.headers.authorization;

		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			return res.status(401).json({ message: "인증 토큰이 없습니다." });
		}

		const token = authHeader.split(" ")[1];
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		const user = await User.findById(decoded.id);
		if (!user) {
			return res.status(401).json({ message: "유효하지 않은 사용자입니다." });
		}

		req.user = user;
		next();
	} catch (err) {
		console.error("인증 실패:", err);
		res.status(401).json({ message: "인증에 실패했습니다." });
	}
};

module.exports = requireAuth;
