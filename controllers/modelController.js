const Model = require("../models/Model");

const getAllModels = async (req, res) => {
	try {
		const filter = {};

		if (req.query.agency) filter.agency = req.query.agency;
		if (req.query.gender) filter.gender = req.query.gender;
		if (req.query.keyword) {
			filter.name = { $regex: req.query.keyword, $options: "i" };
		}
		const models = await Model.find(
			filter,
			"_id name image description agency tags"
		).populate("agency", "name");
		res.status(200).json(models);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

const getRandomModels = async (req, res) => {
	try {
		const limit = parseInt(req.query.limit) || 4;

		const sampled = await Model.aggregate([{ $sample: { size: limit } }]);
		const ids = sampled.map((doc) => doc._id);
		const models = await Model.find({ _id: { $in: ids } }).populate("agency");

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
		res.status(200).json(model);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

const createModel = async (req, res) => {
	try {
		const newModel = new Model(req.body);
		const savedModel = await newModel.save();
		res.status(201).json(savedModel);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
};

const updateModel = async (req, res) => {
	try {
		const updatedModel = await Model.findByIdAndUpdate(
			req.params.id,
			req.body,
			{ new: true }
		);
		if (!updatedModel) {
			return res.status(404).json({ message: "모델을 찾을 수 없습니다" });
		}
		res.json(updatedModel);
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
		res.json({ message: "모델이 삭제되었습니다" });
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
