const Person = require("../models/Person");
const Photo = require("../models/Photo");
const redis = require("../config/redis");

const getAllPeople = async (req, res) => {
	try {
		const { gender, keyword, fields, role } = req.query;

		const filter = {};
		if (gender) filter.gender = gender;
		if (role) filter.role = role;
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
		const filterKey = `gender:${gender || "all"}-role:${
			role || "all"
		}-tags:${tagKey}`;
		const cacheKey = keyword ? null : `people:${filterKey}`;

		const selectFields = fields ? fields.split(",").join(" ") : "";

		if (cacheKey) {
			const cachedData = await redis.get(cacheKey);
			if (cachedData) {
				return res.status(200).json(JSON.parse(cachedData));
			}
		}

		const people = await Person.find(filter, selectFields).populate("name");

		if (cacheKey) {
			redis.setex(cacheKey, 7200, JSON.stringify(people));
		}

		res.status(200).json(people);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

const getRandomPeople = async (req, res) => {
	try {
		const limit = parseInt(req.query.limit) || 4;

		const sampled = await Person.aggregate([{ $sample: { size: limit } }]);
		const ids = sampled.map((doc) => doc._id);
		const people = await Person.find({
			_id: { $in: ids },
		});

		res.status(200).json(people);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

const getPersonById = async (req, res) => {
	try {
		const person = await Person.findById(req.params.id);
		if (!person)
			return res.status(404).json({ message: "아티스트를 찾을 수 없습니다" });

		const etag = `${person._id}-${person.updatedAt.getTime()}`;
		res.setHeader("ETag", etag);
		if (req.headers["if-none-match"] === etag) {
			return res.status(304).end();
		}
		res.setHeader("Cache-Control", "public, max-age=604800");

		res.status(200).json(person);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

const createPerson = async (req, res) => {
	try {
		const newPerson = new Person(req.body);
		const saved = await newPerson.save();

		const keys = await redis.keys("people*");
		if (keys.length > 0) {
			await redis.del(keys);
		}
		const agencyKeys = await redis.keys("agency*");
		if (agencyKeys.length > 0) {
			await redis.del(agencyKeys);
		}

		res.status(201).json(saved);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
};

const updatePerson = async (req, res) => {
	try {
		const person = await Person.findById(req.params.id);
		if (!person) {
			return res.status(404).json({ message: "아티스트를 찾을 수 없습니다" });
		}

		Object.assign(person, req.body);

		await person.save();

		const keys = await redis.keys("people*");
		if (keys.length > 0) {
			await redis.del(keys);
		}
		const agencyKeys = await redis.keys("agency*");
		if (agencyKeys.length > 0) {
			await redis.del(agencyKeys);
		}

		res.json(person);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
};

const deletePerson = async (req, res) => {
	try {
		const deleted = await Person.findByIdAndDelete(req.params.id);
		if (!deleted) {
			return res.status(404).json({ message: "아티스트를 찾을 수 없습니다" });
		}

		const keys = await redis.keys("people*");
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
			{ people: deleted._id },
			{ $pull: { people: deleted._id } }
		);

		res.status(200).json({ message: "아티스트가 삭제되었습니다" });
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
};

module.exports = {
	getAllPeople,
	getRandomPeople,
	getPersonById,
	createPerson,
	updatePerson,
	deletePerson,
};
