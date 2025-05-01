const Agency = require("../models/Agency");
const Model = require("../models/Model");
const Redis = require("ioredis");
const redis = new Redis(process.env.REDIS_URL);

const getAllAgencies = async (req, res) => {
	try {
		const { keyword, fields } = req.query;

		const filter = {};
		if (keyword) {
			filter.name = { $regex: keyword, $options: "i" };
		}

		const selectFields = fields ? fields.split(",").join(" ") : "";

		const cacheKey = keyword ? null : "agencies";
		if (cacheKey) {
			const cachedData = await redis.get(cacheKey);
			if (cachedData) {
				return res.status(200).json(JSON.parse(cachedData));
			}
		}

		const agencies = await Agency.find(filter, selectFields);
		if (cacheKey) {
			redis.setex(cacheKey, 7200, JSON.stringify(agencies));
		}

		res.status(200).json(agencies);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

const getAgencyById = async (req, res) => {
	try {
		const agency = await Agency.findById(req.params.id);
		if (!agency) {
			return res.status(404).json({ message: "에이전시를 찾을 수 없습니다" });
		}

		const models = await Model.find({ agency: agency._id });

		const etag = `${agency._id}-${agency.updatedAt.getTime()}`;
		res.setHeader("ETag", etag);
		if (req.headers["if-none-match"] === etag) {
			return res.status(304).end();
		}
		res.setHeader("Cache-Control", "public, max-age=604800");

		res.status(200).json({
			...agency.toObject(),
			models,
		});
	} catch (err) {
		console.error("Error in getAgencyById:", err);
		res.status(500).json({ error: err.message });
	}
};

const createAgency = async (req, res) => {
	try {
		const newAgency = new Agency(req.body);
		const savedAgency = await newAgency.save();

		const keys = await redis.keys("agencies*");
		if (keys.length > 0) {
			await redis.del(keys);
		}

		res.status(201).json(savedAgency);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
};

const updateAgency = async (req, res) => {
	try {
		const agency = await Agency.findById(req.params.id);
		if (!agency) {
			return res.status(404).json({ message: "에이전시를 찾을 수 없습니다" });
		}

		Object.assign(agency, req.body);
		await agency.save();

		const keys = await redis.keys("agencies*");
		if (keys.length > 0) {
			await redis.del(keys);
		}

		res.json(agency);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
};

const deleteAgency = async (req, res) => {
	try {
		const deletedAgency = await Agency.findByIdAndDelete(req.params.id);
		if (!deletedAgency) {
			return res.status(404).json({ message: "에이전시를 찾을 수 없습니다" });
		}

		const keys = await redis.keys("agencies*");
		if (keys.length > 0) {
			await redis.del(keys);
		}

		res.status(200).json({ message: "에이전시가 삭제되었습니다" });
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
};

module.exports = {
	getAllAgencies,
	getAgencyById,
	createAgency,
	updateAgency,
	deleteAgency,
};
