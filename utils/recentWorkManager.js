const updateRecentWorkEntry = (model, id, action, data) => {
	return model.findByIdAndUpdate(id, {
		[`$${action}`]: { recentWork: data },
	});
};

const addRecentWork = async (targetModel, ids, { type, title, link }) => {
	await Promise.all(
		ids.map((id) =>
			updateRecentWorkEntry(targetModel, id, "push", { type, title, link })
		)
	);
};

const removeRecentWork = async (targetModel, ids, { type, link }) => {
	await Promise.all(
		ids.map((id) =>
			updateRecentWorkEntry(targetModel, id, "pull", { type, link })
		)
	);
};

const updateRecentWork = async (targetModel, ids, { type, title, link }) => {
	await Promise.all(
		ids.map(async (id) => {
			await updateRecentWorkEntry(targetModel, id, "pull", { type, link });
			await updateRecentWorkEntry(targetModel, id, "push", {
				type,
				title,
				link,
			});
		})
	);
};

module.exports = {
	addRecentWork,
	removeRecentWork,
	updateRecentWork,
};
