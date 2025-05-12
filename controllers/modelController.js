const Model = require("../models/Model");
const Agency = require("../models/Agency");
const Photo = require("../models/Photo");
const redis = require("../config/redis");
const paginateQuery = require("../utils/paginateQuery");

const getAllModels = async (req, res) => {
	try {
		const { gender, agency, height, page, limit, keyword, fields } = req.query;

		const filter = {};
		if (gender) filter.gender = gender;
		if (keyword) {
			filter.name = { $regex: keyword, $options: "i" };
		}
		if (height) {
			const [min, max] = height.split("-").map(Number);
			if (!isNaN(min) && !isNaN(max)) {
				filter.height = { $gte: min, $lte: max };
			}
		}

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

		const filterKey = `gender:${gender || "all"}-agency:${
			agency || "all"
		}-height:${height || "all"}-page:${page}`;
		const cacheKey = keyword ? null : `models:${filterKey}`;

		const selectFields = fields ? fields.split(",").join(" ") : "";

		if (cacheKey) {
			const cachedData = await redis.get(cacheKey);
			if (cachedData) {
				console.log("Cache hit for models");
				return res.status(200).json(JSON.parse(cachedData));
			}
			console.log("Cache miss for models, fetching from DB");
		}

		const { query, countQuery } = paginateQuery({
			model: Model,
			filter,
			page,
			limit,
			fields: selectFields,
		});
		query.populate("agency", "name");
		const [models, totalCount] = await Promise.all([query, countQuery]);

		if (cacheKey) {
			redis.setex(cacheKey, 7200, JSON.stringify({ models, totalCount }));
		}

		res.status(200).json({ models, totalCount });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

const getRandomModels = async (req, res) => {
	try {
		const limit = parseInt(req.query.limit) || 4;
		const dateKey = new Date().toISOString().split("T")[0];

		const cacheKey = `randomModels-${dateKey}`;
		const cachedData = await redis.get(cacheKey);

		if (cachedData) {
			console.log("Cache hit for random models");
			return res.status(200).json(JSON.parse(cachedData));
		}

		const sampled = await Model.aggregate([{ $sample: { size: limit } }]);
		const ids = sampled.map((doc) => doc._id);
		const models = await Model.find({ _id: { $in: ids } }).populate("agency");

		await redis.setex(cacheKey, 86400, JSON.stringify(models));
		console.log("Cache set for random models");

		res.status(200).json(models);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

const getModelById = async (req, res) => {
	try {
		const model = await Model.findById(req.params.id).populate("agency");
		if (!model)
			return res.status(404).json({ message: "모델을 찾을 수 없습니다" });

		const etag = `${model._id}-${model.updatedAt.getTime()}`;
		res.setHeader("ETag", etag);
		if (req.headers["if-none-match"] === etag) {
			return res.status(304).end();
		}
		res.setHeader("Cache-Control", "public, max-age=604800");

		res.status(200).json(model);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

const createModel = async (req, res) => {
	try {
		const newModel = new Model(req.body);
		const savedModel = await newModel.save();

		const keys = await redis.keys("models*");
		if (keys.length > 0) {
			await redis.del(keys);
		}
		const agencyKeys = await redis.keys("agency*");
		if (agencyKeys.length > 0) {
			await redis.del(agencyKeys);
		}

		res.status(201).json(savedModel);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
};

const updateModel = async (req, res) => {
	try {
		const model = await Model.findById(req.params.id);
		if (!model) {
			return res.status(404).json({ message: "모델을 찾을 수 없습니다" });
		}

		Object.assign(model, req.body);

		await model.save();

		const keys = await redis.keys("models*");
		if (keys.length > 0) {
			await redis.del(keys);
		}
		const agencyKeys = await redis.keys("agency*");
		if (agencyKeys.length > 0) {
			await redis.del(agencyKeys);
		}

		res.json(model);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
};

const deleteModel = async (req, res) => {
	try {
		const deletedModel = await Model.findByIdAndDelete(req.params.id);
		if (!deletedModel) {
			return res.status(404).json({ message: "모델을 찾을 수 없습니다" });
		}

		const keys = await redis.keys("models*");
		if (keys.length > 0) {
			await redis.del(keys);
		}
		const agencyKeys = await redis.keys("agency*");
		if (agencyKeys.length > 0) {
			await redis.del(agencyKeys);
		}
		const photoKeys = await redis.keys("photos*");
		if (photoKeys.length > 0) {
			await redis.del(photoKeys);
		}

		await Photo.updateMany(
			{ models: deletedModel._id },
			{ $pull: { models: deletedModel._id } }
		);

		res.status(200).json({ message: "모델이 삭제되었습니다" });
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
};

module.exports = {
	getAllModels,
	getModelById,
	getRandomModels,
	createModel,
	updateModel,
	deleteModel,
};
