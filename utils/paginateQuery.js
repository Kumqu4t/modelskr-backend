const paginateQuery = ({ model, filter, page = 1, limit = 16, fields }) => {
	const skip = (page - 1) * limit;
	const query = model.find(filter, fields).skip(skip).limit(limit);
	const countQuery = model.countDocuments(filter);

	return { query, countQuery };
};

module.exports = paginateQuery;
