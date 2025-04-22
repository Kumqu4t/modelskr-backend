const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.getCurrentUser = (req, res) => {
	const { _id, name, email, picture } = req.user;
	res.status(200).json({ _id, name, email, picture });
};

exports.googleLogin = async (req, res) => {
	const { token } = req.body;

	try {
		const ticket = await client.verifyIdToken({
			idToken: token,
			audience: process.env.GOOGLE_CLIENT_ID,
		});

		const payload = ticket.getPayload();
		const { email, name, picture } = payload;

		let user = await User.findOne({ email });
		if (!user) {
			user = await User.create({ email, name, picture });
		}

		// JWT 발급
		const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
			expiresIn: "7d",
		});

		res.status(200).json({ token: jwtToken, user });
	} catch (err) {
		console.error("구글 로그인 실패:", err);
		res.status(401).json({ message: "유효하지 않은 토큰" });
	}
};
