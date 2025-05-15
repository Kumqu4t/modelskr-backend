const fs = require("fs");
const path = require("path");
const axios = require("axios");

const FRONT_PUBLIC_PATH = path.join(
	__dirname,
	"../../modelskr/public/sitemap.xml"
);
const API_URL = "http://localhost:8000/api/models?limit=1000";
const PEOPLE_API_URL = "http://localhost:8000/api/people?limit=1000";
const PHOTO_API_URL = "http://localhost:8000/api/photos?limit=1000";

const STATIC_ROUTES = ["/", "/models", "/people", "/photos", "/agencies"];

async function generateSitemap() {
	try {
		const res = await axios.get(API_URL);
		const peopleRes = await axios.get(PEOPLE_API_URL);
		const photoRes = await axios.get(PHOTO_API_URL);
		const models = res.data.models || [];
		const people = peopleRes.data.people || [];
		const photos = photoRes.data.photos || [];

		const staticUrls = STATIC_ROUTES.map(
			(path) => `<url><loc>https://modelskr.vercel.app${path}</loc></url>`
		);

		const modelUrls = models.map(
			(model) =>
				`<url><loc>https://modelskr.vercel.app/models/${model._id}</loc></url>`
		);
		const peopleUrls = people.map(
			(person) =>
				`<url><loc>https://modelskr.vercel.app/people/${person._id}</loc></url>`
		);
		const photoUrls = photos.map(
			(photo) =>
				`<url><loc>https://modelskr.vercel.app/photos/${photo._id}</loc></url>`
		);
		const dynamicUrls = [...modelUrls, ...peopleUrls, ...photoUrls];

		const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticUrls, ...dynamicUrls].join("\n")}
</urlset>`;

		fs.writeFileSync(FRONT_PUBLIC_PATH, sitemap, "utf-8");
		console.log("sitemap.xml 생성 완료!");
	} catch (err) {
		console.error("sitemap 생성 실패:", err);
	}
}

generateSitemap();
