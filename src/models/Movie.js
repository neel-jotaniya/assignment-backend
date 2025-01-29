const mongoose = require("mongoose");
const movieSchema = new mongoose.Schema({
    title: { type: String, required: true },
    director: { type: String, required: true },
    releaseDate: { type: Date, required: true },
    genre: { type: String },
    rating: { type: Number, min: 0, max: 10 },
    description: { type: String },
    poster: { type: String },
    createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model("Movie", movieSchema);