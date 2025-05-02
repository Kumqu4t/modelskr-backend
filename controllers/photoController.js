const Photo = require("../models/Photo");
const Model = require("../models/Model");
const redis = require("../config/redis");
const Photographer = require("../models/Photographer");
const {
	addRecentWork,
	removeRecentWork,
	updateRecentWork,
} = require("../utils/recentWorkManager");

const updateRecentWorkForEntities = async (
	model,
	oldIds,
	newIds,
	{ type, title, link }
) => {
	const removed = oldIds.filter((id) => !newIds.includes(id));
	const added = newIds.filter((id) => !oldIds.includes(id));

	await removeRecentWork(model, removed, { type, link });
	await addRecentWork(model, added, { type, title, link });
	await updateRecentWork(model, newIds, { type, title, link });
};

const getAllPhotos = async (req, res) => {
	try {
		const { category, keyword, fields } = req.query;
		console.log("Received category:", category, "keyword:", keyword);

		const filter = {};
		if (category && category !== "all") filter.category = category;
		if (keyword) filter.title = { $regex: keyword, $options: "i" };

		const selectFields = fields ? fields.split(",").join(" ") : "";

		const cacheKey = keyword
			? null
			: category && category !== "all"
			? `photos:${category}`
			: "photos";

		if (cacheKey) {
			const cachedData = await redis.get(cacheKey);
			if (cachedData) {
				console.log("Cache hit!");
				return res.status(200).json(JSON.parse(cachedData));
			}
		}

		const photos = await Photo.find(filter, selectFields)
			.populate("models", "_id name image description")
			.populate("photographers", "_id name image description");

		console.log("Photos:", photos);

		if (cacheKey) {
			redis.setex(cacheKey, 7200, JSON.stringify(photos));
		}

		res.status(200).json(photos);
	} catch (err) {
		res.status(500).json({ error: "사진 목록 불러오기 실패" });
	}
};

const getPhotoById = async (req, res) => {
	try {
		const photo = await Photo.findById(req.params.id)
			.populate("models", "_id name image description")
			.populate("photographers", "_id name image description");
		if (!photo)
			return res.status(404).json({ error: "사진을 찾을 수 없습니다" });

		const etag = `${photo._id}-${photo.updatedAt.getTime()}`;
		res.setHeader("ETag", etag);
		if (req.headers["if-none-match"] === etag) {
			return res.status(304).end();
		}
		res.setHeader("Cache-Control", "public, max-age=604800");

		res.status(200).json(photo);
	} catch (err) {
		res.status(500).json({ error: "사진 조회 실패" });
	}
};

const createPhoto = async (req, res) => {
	try {
		const newPhoto = await Photo.create(req.body);

		await addRecentWork(Model, newPhoto.models, {
			type: "photo",
			title: newPhoto.title,
			link: `/photos/${newPhoto._id}`,
		});

		await addRecentWork(Photographer, newPhoto.photographers, {
			type: "photo",
			title: newPhoto.title,
			link: `/photos/${newPhoto._id}`,
		});

		const keys = await redis.keys("photos*");
		if (keys.length > 0) {
			await redis.del(keys);
		}
		const modelKeys = await redis.keys("models*");
		if (modelKeys.length > 0) {
			await redis.del(modelKeys);
		}
		const agencyKeys = await redis.keys("agency*");
		if (agencyKeys.length > 0) {
			await redis.del(agencyKeys);
		}

		res.status(201).json(newPhoto);
	} catch (err) {
		res.status(500).json({ error: "사진 생성 실패", details: err.message });
	}
};

const updatePhoto = async (req, res) => {
	try {
		const photo = await Photo.findById(req.params.id);
		if (!photo) {
			return res.status(404).json({ error: "사진을 찾을 수 없습니다" });
		}

		const oldModels = photo.models.map((id) => id.toString());
		const oldPhotographers = photo.photographers.map((id) => id.toString());

		const newModels = req.body.models.map((m) =>
			typeof m === "string" ? m : m._id
		);
		const newPhotographers = req.body.photographers.map((p) =>
			typeof p === "string" ? p : p._id
		);

		Object.assign(photo, req.body);
		await photo.save();

		await updateRecentWorkForEntities(Model, oldModels, newModels, {
			type: "photo",
			title: photo.title,
			link: `/photos/${photo._id}`,
		});

		await updateRecentWorkForEntities(
			Photographer,
			oldPhotographers,
			newPhotographers,
			{
				type: "photo",
				title: photo.title,
				link: `/photos/${photo._id}`,
			}
		);

		const keys = await redis.keys("photos*");
		if (keys.length > 0) {
			await redis.del(keys);
		}
		const modelKeys = await redis.keys("models*");
		if (modelKeys.length > 0) {
			await redis.del(modelKeys);
		}
		const agencyKeys = await redis.keys("agency*");
		if (agencyKeys.length > 0) {
			await redis.del(agencyKeys);
		}

		res.status(200).json(photo);
	} catch (err) {
		res.status(500).json({ error: "사진 수정 실패", details: err.message });
	}
};

const deletePhoto = async (req, res) => {
	try {
		const deletedPhoto = await Photo.findByIdAndDelete(req.params.id);
		if (!deletedPhoto)
			return res.status(404).json({ error: "사진을 찾을 수 없습니다" });

		await removeRecentWork(Model, deletedPhoto.models, {
			type: "photo",
			link: `/photos/${deletedPhoto._id}`,
		});
		await removeRecentWork(Photographer, deletedPhoto.photographers, {
			type: "photo",
			link: `/photos/${deletedPhoto._id}`,
		});

		const keys = await redis.keys("photos*");
		if (keys.length > 0) {
			await redis.del(keys);
		}
		const modelKeys = await redis.keys("models*");
		if (modelKeys.length > 0) {
			await redis.del(modelKeys);
		}
		const agencyKeys = await redis.keys("agency*");
		if (agencyKeys.length > 0) {
			await redis.del(agencyKeys);
		}

		res.status(200).json({ message: "삭제 완료" });
	} catch (err) {
		res.status(500).json({ error: "사진 삭제 실패" });
	}
};

module.exports = {
	createPhoto,
	getAllPhotos,
	getPhotoById,
	updatePhoto,
	deletePhoto,
};
