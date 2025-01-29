const express = require("express");
const router = express.Router();
const movieController = require("../controllers/movieController");

// Place specific routes before parameterized routes
router.get("/search", movieController.searchMovies);
router.get("/filter", movieController.filterMovies);
router.get("/sort", movieController.sortMovies);

// Generic CRUD routes
router.get("/", movieController.getAllMovies);
router.post("/", movieController.addMovie);

// Parameterized routes should come last
router.get("/:id", movieController.getMovieById);
router.put("/:id", movieController.updateMovie);
router.delete("/:id", movieController.deleteMovie);

module.exports = router;