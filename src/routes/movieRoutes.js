const express = require("express");
const router = express.Router();
const movieController = require("../controllers/movieController");
const { authMiddleware } = require("../middleware/authMiddleware");

// Public Routes
router.get("/search", movieController.searchMovies);
router.get("/filter", movieController.filterMovies);
router.get("/sort", movieController.sortMovies);
router.get("/", movieController.getAllMovies);
router.get("/:id", movieController.getMovieById);

// Protected Routes (Only logged-in users can access)
router.post("/", authMiddleware, movieController.addMovie);
router.put("/:id", authMiddleware, movieController.updateMovie);
router.delete("/:id", authMiddleware, movieController.deleteMovie);

module.exports = router;
