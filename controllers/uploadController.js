const cloudinary = require("../config/cloudinary.js");

const uploadImage = async (req, res) => {
	try {
		if (!req.file) {
			return res.status(400).json({ message: "No file uploaded" });
		}

		const uploadStream = cloudinary.uploader.upload_stream(
			{ folder: "modelskr" },
			(error, result) => {
				if (error) {
					return res
						.status(500)
						.json({ message: "Upload to Cloudinary failed", error });
				}
				return res.status(200).json({ url: result.secure_url });
			}
		);

		uploadStream.end(req.file.buffer);
	} catch (err) {
		res.status(500).json({ message: "Server error", error: err });
	}
};

module.exports = { uploadImage };
