const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
	email: { type: String, required: true, unique: true },
	name: String,
	picture: String,
	favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Model" }],
});

module.exports = mongoose.model("User", userSchema);
