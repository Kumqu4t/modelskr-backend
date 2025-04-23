const mongoose = require("mongoose");

const photoSchema = new mongoose.Schema(
	{
		images: {
			type: [String],
			required: true,
		},
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
		description: String,
		tags: [String],
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Photo", photoSchema);
