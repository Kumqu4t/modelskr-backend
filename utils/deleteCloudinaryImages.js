const getCloudinary = require("../config/cloudinary");
const cloudinary = getCloudinary();

const deleteCloudinaryImages = async (images) => {
	const imageList = Array.isArray(images) ? images : [images];

	const deletePromises = imageList.map(
		(img) =>
			new Promise((resolve, reject) => {
				if (!img.public_id || img.public_id.trim() === "") return resolve();

				cloudinary.uploader.destroy(img.public_id, (error, result) => {
					if (error) return reject(error);
					resolve(result);
				});
			})
	);

	const results = await Promise.allSettled(deletePromises);

	results.forEach((result, i) => {
		if (result.status === "rejected") {
			console.error(
				`Cloudinary 삭제 실패: ${imageList[i]?.public_id}`,
				result.reason
			);
		}
	});
};

module.exports = deleteCloudinaryImages;
