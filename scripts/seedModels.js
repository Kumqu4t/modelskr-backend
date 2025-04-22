// use with node scripts/seedModels.js
const fs = require("fs");
const mongoose = require("mongoose");
const Model = require("../models/Model"); // Model 모델 가져오기
const Agency = require("../models/Agency"); // Agency 모델 가져오기

const path = `${__dirname}/models.json`; // 모델 JSON 경로

console.log("현재 경로:", __dirname);
console.log("존재하나요?", fs.existsSync(path)); // 경로 확인

// 1. JSON 파일 불러오기
const models = JSON.parse(fs.readFileSync(path, "utf-8"));

// 2. MongoDB 연결
mongoose
	.connect("mongodb://localhost:27017/modelskr")
	.then(async () => {
		console.log("MongoDB connected");

		// 기존 DB 데이터 삭제 (선택)
		await Model.deleteMany({});
		console.log("기존 데이터 삭제 완료");

		// 3. 각 모델에 대해 agency name을 찾아서 _id로 바꾸기
		const modelsWithAgencies = [];
		for (const model of models) {
			const agency = await Agency.findOne({
				name: new RegExp(`^${model.agency}$`, "i"),
			});
			if (!agency) {
				console.log(`Agency not found for: ${model.agency}`);
				continue; // skip this model if agency is not found
			}
			modelsWithAgencies.push({
				...model,
				agency: agency._id,
			});
		}

		// 4. insertMany로 한 번에 저장
		await Model.insertMany(
			modelsWithAgencies.map((m) => ({
				name: m.name,
				gender: m.gender,
				isFavorite: m.isFavorite,
				tags: m.tags,
				recentWork: m.recentWork,
				contact: m.contact,
				image: m.image,
				description: m.description,
				agency: m.agency, // 이제 agency는 ObjectId로 되어 있음
			}))
		);

		console.log("데이터 등록 완료");
		mongoose.disconnect();
	})
	.catch((err) => {
		console.error("MongoDB 연결 실패", err);
	});
