const mongoose = require("mongoose");

const modelSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		gender: { type: String, enum: ["male", "female"], required: true },
		birthDate: { type: Date },
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
		image: String,
		description: String,
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Model", modelSchema);
