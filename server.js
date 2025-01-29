require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const movieRoutes = require("./src/routes/movieRoutes");
const { errorHandler } = require("./src/middleware/errorHandler");
const connectDB = require("./src/config/db");

const app = express();
app.use(express.json());
connectDB();

app.use("/movies", movieRoutes);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));