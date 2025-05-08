const mongoose = require("mongoose");

const personSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		gender: { type: String, enum: ["male", "female"] },
		role: {
			type: String,
			enum: ["photographer", "hair", "makeup"],
			required: true,
		},
		birthDate: { type: Number },
		nationality: { type: String },
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
				url: { type: String },
				public_id: { type: String },
			},
		},
		description: String,
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Person", personSchema);
