// use with node scripts/seedAgencies.js
const fs = require("fs");
const mongoose = require("mongoose");
const Agency = require("../models/Agency");

const path = `${__dirname}/agencies.json`;

console.log("현재 경로:", __dirname);
console.log("존재하나요?", fs.existsSync(path)); // 절대경로 확인

// 1. JSON 파일 불러오기
const agencies = JSON.parse(fs.readFileSync(path, "utf-8"));

// 2. MongoDB 연결
mongoose
	.connect("mongodb://localhost:27017/modelskr")
	.then(async () => {
		console.log("MongoDB connected");

		// 기존 DB 데이터 삭제 (선택)
		await Agency.deleteMany({});
		console.log("기존 데이터 삭제 완료");

		// 3. insertMany로 한 번에 저장
		await Agency.insertMany(
			agencies.map((a) => ({
				name: a.name,
				description: a.description,
				logo: a.logo,
				homepage: a.homepage,
			}))
		);

		console.log("데이터 등록 완료");
		mongoose.disconnect();
	})
	.catch((err) => {
		console.error("MongoDB 연결 실패", err);
	});
