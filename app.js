const express = require("express");
const mongoose = require("mongoose");
const app = express();
const PORT = 8000;

mongoose
	.connect("mongodb://localhost:27017/modelskr")
	.then(() => console.log("MongoDB connected"))
	.catch((err) => console.error("DB connection error:", err));

app.use(express.json());

const modelRoutes = require("./routes/models");
app.use("/models", modelRoutes);

app.get("/", (req, res) => {
	res.send("Hello from server!");
});

app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
