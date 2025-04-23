const Photo = require("../models/Photo");
const Model = require("../models/Model");
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

		res.status(201).json(newPhoto);
	} catch (err) {
		res.status(500).json({ error: "사진 생성 실패", details: err.message });
	}
};

const getAllPhotos = async (req, res) => {
	try {
		const photos = await Photo.find()
			.populate("models", "_id name image description")
			.populate("photographers", "_id name image description");
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
		res.status(200).json(photo);
	} catch (err) {
		res.status(500).json({ error: "사진 조회 실패" });
	}
};

const updatePhoto = async (req, res) => {
	try {
		const existingPhoto = await Photo.findById(req.params.id);
		if (!existingPhoto) {
			return res.status(404).json({ error: "사진을 찾을 수 없습니다" });
		}

		const oldModels = existingPhoto.models.map((id) => id.toString());
		const newModels = req.body.models.map((m) =>
			typeof m === "string" ? m : m._id
		);
		const oldPhotographers = existingPhoto.photographers.map((id) =>
			id.toString()
		);
		const newPhotographers = req.body.photographers.map((p) =>
			typeof p === "string" ? p : p._id
		);

		const updatedPhoto = await Photo.findByIdAndUpdate(
			req.params.id,
			req.body,
			{ new: true }
		);

		await updateRecentWorkForEntities(Model, oldModels, newModels, {
			type: "photo",
			title: updatedPhoto.title,
			link: `/photos/${updatedPhoto._id}`,
		});

		await updateRecentWorkForEntities(
			Photographer,
			oldPhotographers,
			newPhotographers,
			{
				type: "photo",
				title: updatedPhoto.title,
				link: `/photos/${updatedPhoto._id}`,
			}
		);

		res.status(200).json(updatedPhoto);
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

		res.status(204).json({ message: "삭제 완료" });
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
