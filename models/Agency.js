const mongoose = require("mongoose");

const agencySchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		description: { type: String, required: true },
		logo: { type: String, required: true },
		homepage: { type: String, required: true },
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Agency", agencySchema);
