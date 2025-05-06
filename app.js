const express = require("express");
const connectDB = require("./utils/connectDB");
const app = express();
const PORT = 8000;
require("dotenv").config();

connectDB();

app.use(express.json());

const cors = require("cors");
app.use(cors());
app.use((req, res, next) => {
	res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
	next();
});

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
const adminRoutes = require("./routes/admin");
app.use("/api/admin", adminRoutes);
const uploadRoutes = require("./routes/upload");
app.use("/api/upload", uploadRoutes);

app.get("/", (req, res) => {
	res.send("Hello from server!");
});
app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
