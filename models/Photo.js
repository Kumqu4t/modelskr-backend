const mongoose = require("mongoose");

const photoSchema = new mongoose.Schema(
	{
		images: [
			{
				url: {
					type: String,
					required: true,
				},
				public_id: {
					type: String,
					required: true,
				},
			},
		],
		title: {
			type: String,
			required: true,
		},
		models: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Model",
			},
		],
		photographers: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Photographer",
			},
		],
		category: {
			type: String,
			enum: ["commercial", "editorial", "others"],
			default: "others",
		},
		description: String,
		tags: [String],
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Photo", photoSchema);
