const Agency = require("../models/Agency");
const Model = require("../models/Model");
const Redis = require("ioredis");
const redis = new Redis(process.env.REDIS_URL);

const getAllAgencies = async (req, res) => {
	try {
		const cacheKey = "agencies";
		const cachedData = await redis.get(cacheKey);
		if (cachedData) {
			return res.status(200).json(JSON.parse(cachedData));
		}

		const agencies = await Agency.find();
		redis.setex(cacheKey, 3600, JSON.stringify(agencies));

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

		res.status(200).json({
			...agency.toObject(),
			models,
		});
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

const createAgency = async (req, res) => {
	try {
		const newAgency = new Agency(req.body);
		const savedAgency = await newAgency.save();

		const cacheKey = "agencies";
		res.del(cacheKey);

		res.status(201).json(savedAgency);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
};

const updateAgency = async (req, res) => {
	try {
		const updatedAgency = await Agency.findByIdAndUpdate(
			req.params.id,
			req.body,
			{ new: true }
		);
		if (!updatedAgency) {
			return res.status(404).json({ message: "에이전시를 찾을 수 없습니다" });
		}

		const cacheKey = "agencies";
		res.del(cacheKey);

		res.json(updatedAgency);
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

		const cacheKey = "agencies";
		res.del(cacheKey);

		res.json({ message: "에이전시가 삭제되었습니다" });
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
