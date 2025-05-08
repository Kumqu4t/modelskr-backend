const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
	email: { type: String, required: true, unique: true },
	name: String,
	picture: String,
	favorites: [
		{
			item: {
				type: mongoose.Schema.Types.ObjectId,
				required: true,
				refPath: "favorites.kind",
			},
			kind: {
				type: String,
				required: true,
				enum: ["Model", "Person", "Photo"],
			},
		},
	],
});

module.exports = mongoose.model("User", userSchema);
