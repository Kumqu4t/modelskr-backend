const mongoose = require("mongoose");

const modelSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		gender: { type: String, enum: ["male", "female"], required: true },
		agency: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Agency",
			required: true,
		},
		isFavorite: { type: Boolean, default: false },
		tags: [String],
		recentWork: [
			{
				title: { type: String },
				type: { type: String },
				link: { type: String },
			},
		],
		contact: String,
		image: String,
		description: String,
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Model", modelSchema);
