const mongoose = require("mongoose");

const photographerSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		gender: { type: String, enum: ["male", "female"], required: true },
		agency: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Agency",
		},
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

module.exports = mongoose.model("Photographer", photographerSchema);
