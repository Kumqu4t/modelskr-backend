const getCloudinary = require("../config/cloudinary");
const cloudinary = getCloudinary();

const uploadImage = async (req, res) => {
	console.log("Cloudinary config loaded with:", cloudinary.config());
	try {
		console.log("uploadImage route hit");
		console.log("req.file:", req.file);

		if (!req.file) {
			return res.status(400).json({ message: "No file uploaded" });
		}

		const uploadStream = cloudinary.uploader.upload_stream(
			{ folder: "modelskr" },
			(error, result) => {
				if (error) {
					console.error("Cloudinary upload error:", error);
					return res
						.status(500)
						.json({ message: "Upload to Cloudinary failed", error });
				}
				return res
					.status(200)
					.json({ url: result.secure_url, public_id: result.public_id });
			}
		);

		uploadStream.end(req.file.buffer);
	} catch (err) {
		console.error("Server error in uploadImage:", err);
		res.status(500).json({ message: "Server error", error: err });
	}
};

const removeImage = async (req, res) => {
	try {
		const { public_id } = req.body;

		if (!public_id) {
			return res.status(400).json({ error: "public_id is required" });
		}

		const result = await cloudinary.uploader.destroy(public_id);

		if (result.result !== "ok") {
			return res
				.status(500)
				.json({ error: "Failed to delete image from Cloudinary" });
		}

		return res.status(200).json({ message: "Image deleted successfully" });
	} catch (error) {
		console.error("Error deleting image:", error);
		return res.status(500).json({ error: "Server error while deleting image" });
	}
};

module.exports = { uploadImage, removeImage };
