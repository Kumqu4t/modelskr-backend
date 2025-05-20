const streamifier = require("streamifier");
const getCloudinary = require("../config/cloudinary");
const cloudinary = getCloudinary();

const uploadImage = async (req, res) => {
	try {
		if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
			return res.status(400).json({ message: "No files uploaded" });
		}

		const uploadPromises = req.files.map(
			(file) =>
				new Promise((resolve, reject) => {
					const uploadStream = cloudinary.uploader.upload_stream(
						{ folder: "modelskr" },
						(error, result) => {
							if (error) return reject(error);
							resolve({
								url: result.secure_url,
								public_id: result.public_id,
							});
						}
					);

					// 스트림으로 변환 후 pipe로 스트림에 연결.
					streamifier.createReadStream(file.buffer).pipe(uploadStream);
				})
		);

		const results = await Promise.all(uploadPromises);
		return res.status(200).json({ images: results });
	} catch (err) {
		console.error("Error uploading images:", err);
		res.status(500).json({ message: "서버 오류", error: err.message });
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
