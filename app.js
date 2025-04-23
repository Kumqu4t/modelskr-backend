const express = require("express");
const mongoose = require("mongoose");
const app = express();
const PORT = 8000;
require("dotenv").config();

mongoose
	.connect("mongodb://localhost:27017/modelskr")
	.then(() => console.log("MongoDB connected"))
	.catch((err) => console.error("DB connection error:", err));

app.use(express.json());

const modelRoutes = require("./routes/models");
app.use("/api/models", modelRoutes);
const agencyRoutes = require("./routes/agencies");
app.use("/api/agencies", agencyRoutes);
const photographerRoutes = require("./routes/photographers");
app.use("/api/photographers", photographerRoutes);
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);
const favoriteRoutes = require("./routes/favorites");
app.use("/api/favorites", favoriteRoutes);
const photoRoutes = require("./routes/photos");
app.use("/api/photos", photoRoutes);

app.get("/", (req, res) => {
	res.send("Hello from server!");
});

app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
