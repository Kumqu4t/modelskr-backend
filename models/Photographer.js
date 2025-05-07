const mongoose = require("mongoose");

const photographerSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		gender: { type: String, enum: ["male", "female"], required: true },
		birthDate: { type: Number },
		nationality: { type: String },
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

module.exports = mongoose.model("Photographer", photographerSchema);
