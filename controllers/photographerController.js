const Photographer = require("../models/Photographer");
const Photo = require("../models/Photo");
const Redis = require("ioredis");
const redis = new Redis(process.env.REDIS_URL);

const getAllPhotographers = async (req, res) => {
	try {
		const cacheKey = "photographers";
		const cachedData = await redis.get(cacheKey);
		if (cachedData) {
			return res.status(200).json(JSON.parse(cachedData));
		}
		const filter = {};

		if (req.query.agency) filter.agency = req.query.agency;
		if (req.query.gender) filter.gender = req.query.gender;
		if (req.query.keyword) {
			filter.name = { $regex: req.query.keyword, $options: "i" };
		}

		const photographers = await Photographer.find(
			filter,
			"_id name image gender description agency tags"
		).populate("agency", "name");

		redis.setex(cacheKey, 3600, JSON.stringify(photographers));

		res.status(200).json(photographers);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

const getRandomPhotographers = async (req, res) => {
	try {
		const limit = parseInt(req.query.limit) || 4;

		const sampled = await Photographer.aggregate([
			{ $sample: { size: limit } },
		]);
		const ids = sampled.map((doc) => doc._id);
		const photographers = await Photographer.find({
			_id: { $in: ids },
		}).populate("agency");

		res.status(200).json(photographers);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

const getPhotographerById = async (req, res) => {
	try {
		const photographer = await Photographer.findById(req.params.id).populate(
			"agency"
		);
		if (!photographer)
			return res.status(404).json({ message: "작가를 찾을 수 없습니다" });
		res.status(200).json(photographer);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

const createPhotographer = async (req, res) => {
	try {
		const newPhotographer = new Photographer(req.body);
		const saved = await newPhotographer.save();

		const cacheKey = "photographers";
		redis.del(cacheKey);

		res.status(201).json(saved);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
};

const updatePhotographer = async (req, res) => {
	try {
		const updated = await Photographer.findByIdAndUpdate(
			req.params.id,
			req.body,
			{ new: true }
		);
		if (!updated) {
			return res.status(404).json({ message: "작가를 찾을 수 없습니다" });
		}

		const cacheKey = "photographers";
		redis.del(cacheKey);

		res.json(updated);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
};

const deletePhotographer = async (req, res) => {
	try {
		const deleted = await Photographer.findByIdAndDelete(req.params.id);
		if (!deleted) {
			return res.status(404).json({ message: "작가를 찾을 수 없습니다" });
		}

		await Photo.updateMany(
			{ photographers: deleted._id },
			{ $pull: { photographers: deleted._id } }
		);

		const cacheKey = "photographers";
		redis.del(cacheKey);

		res.json({ message: "작가가 삭제되었습니다" });
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
};

module.exports = {
	getAllPhotographers,
	getRandomPhotographers,
	getPhotographerById,
	createPhotographer,
	updatePhotographer,
	deletePhotographer,
};
