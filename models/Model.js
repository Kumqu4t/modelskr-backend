const mongoose = require("mongoose");

const modelSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		gender: { type: String, enum: ["male", "female"], required: true },
		birthYear: { type: Number },
		nationality: { type: String },
		height: { type: Number },
		measurements: {
			chest: { type: Number },
			waist: { type: Number },
			hips: { type: Number },
		},
		shoeSize: { type: Number },
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
		image: {
			type: {
				url: { type: String, required: true },
				public_id: { type: String, required: true },
			},
		},
		description: String,
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Model", modelSchema);
