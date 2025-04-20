const mongoose = require("mongoose");

const recentWorkSchema = new mongoose.Schema(
	{
		title: String,
		type: String,
		link: String,
	},
	{ _id: false } // recentWork 안에 _id 안 붙게
);

const modelSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		gender: { type: String, enum: ["male", "female"], required: true },
		agency: { type: String, required: true },
		isFavorite: { type: Boolean, default: false },
		tags: [String],
		recentWork: [recentWorkSchema],
		contact: String,
		image: String,
		description: String,
	},
	{ timestamps: true }
);

module.exports = module.exports =
	mongoose.models.Model || mongoose.model("Model", modelSchema);
