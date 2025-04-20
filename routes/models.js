const express = require("express");
const router = express.Router();
const Model = require("../models/Model");

router.get("/", async (req, res) => {
	try {
		const filter = {};

		if (req.query.agency) filter.agency = req.query.agency;
		if (req.query.gender) filter.gender = req.query.gender;

		const models = await Model.find(filter);
		res.json(models);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

router.get("/:id", async (req, res) => {
	try {
		const model = await Model.findById(req.params.id);
		if (!model)
			return res.status(404).json({ message: "모델을 찾을 수 없습니다" });
		res.json(model);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

router.post("/", async (req, res) => {
	try {
		const newModel = new Model(req.body);
		const savedModel = await newModel.save();
		res.status(201).json(savedModel);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

router.patch("/:id", async (req, res) => {
	try {
		const updatedModel = await Model.findByIdAndUpdate(
			req.params.id,
			req.body,
			{ new: true }
		);
		res.json(updatedModel);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

router.delete("/:id", async (req, res) => {
	try {
		await Model.findByIdAndDelete(req.params.id);
		res.json({ message: "모델이 삭제되었습니다" });
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

module.exports = router;
