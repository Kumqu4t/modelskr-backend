const Photographer = require("../models/Photographer");
const Photo = require("../models/Photo");
const Agency = require("../models/Agency");
const Redis = require("ioredis");
const redis = new Redis(process.env.REDIS_URL);

const getAllPhotographers = async (req, res) => {
	try {
		const { agency, gender, keyword, fields } = req.query;

		const filter = {};
		if (agency) {
			if (agency === "무소속") {
				filter.agency = null;
			} else {
				const foundAgency = await Agency.findOne({ name: agency });
				if (!foundAgency) {
					return res
						.status(404)
						.json({ error: "해당 에이전시를 찾을 수 없습니다." });
				}
				filter.agency = foundAgency._id;
			}
		}
		if (gender) filter.gender = gender;
		if (keyword) {
			filter.name = { $regex: keyword, $options: "i" };
		}

		const tagArray = req.query.tag
			? Array.isArray(req.query.tag)
				? req.query.tag
				: [req.query.tag]
			: [];

		if (tagArray.length > 0) {
			filter.tags = { $all: tagArray };
		}

		const tagKey = tagArray.length > 0 ? tagArray.join(",") : "none";
		const filterKey = `gender:${gender || "all"}-agency:${
			agency || "all"
		}-tags:${tagKey}`;
		const cacheKey = keyword ? null : `photographers:${filterKey}`;

		const selectFields = fields ? fields.split(",").join(" ") : "";

		if (cacheKey) {
			const cachedData = await redis.get(cacheKey);
			if (cachedData) {
				return res.status(200).json(JSON.parse(cachedData));
			}
		}

		const photographers = await Photographer.find(
			filter,
			selectFields
		).populate("agency", "name");

		if (cacheKey) {
			redis.setex(cacheKey, 7200, JSON.stringify(photographers));
		}

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

		const etag = `${photographer._id}-${photographer.updatedAt.getTime()}`;
		res.setHeader("ETag", etag);
		if (req.headers["if-none-match"] === etag) {
			return res.status(304).end();
		}
		res.setHeader("Cache-Control", "public, max-age=604800");

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
		const allPhotographers = await Photographer.find();
		redis.setex(cacheKey, 7200, JSON.stringify(allPhotographers));

		res.status(201).json(saved);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
};

const updatePhotographer = async (req, res) => {
	try {
		const photographer = await Photographer.findById(req.params.id);
		if (!photographer) {
			return res.status(404).json({ message: "작가를 찾을 수 없습니다" });
		}

		Object.assign(photographer, req.body);
		await photographer.save();

		const cacheKey = "photographers";
		const allPhotographers = await Photographer.find();
		redis.setex(cacheKey, 7200, JSON.stringify(allPhotographers));

		res.json(photographer);
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
		const allPhotographers = await Photographer.find();
		redis.setex(cacheKey, 7200, JSON.stringify(allPhotographers));

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
