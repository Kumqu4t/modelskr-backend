const mongoose = require("mongoose");

const connectDB = async () => {
	if (mongoose.connection.readyState === 1) {
		console.log("Already connected to MongoDB");
		return;
	}

	try {
		await mongoose.connect(process.env.MONGO_URI);
		console.log("MongoDB connected");
	} catch (error) {
		console.error("DB connection error:", error);
	}
};

module.exports = connectDB;
