const Movie = require("../models/Movie");


const escapeRegex = (string) => {
    return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};
exports.getAllMovies = async (req, res) => {
    try {
        const movies = await Movie.find();
        console.log(movies);
        res.json(movies);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};

exports.getMovieById = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) return res.status(404).json({ error: "Movie not found" });
        res.json(movie);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};

exports.addMovie = async (req, res) => {
    try {
        const movie = new Movie(req.body);
        await movie.save();
        res.status(201).json(movie);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.updateMovie = async (req, res) => {
    try {
        const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!movie) return res.status(404).json({ error: "Movie not found" });
        res.json(movie);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};

exports.deleteMovie = async (req, res) => {
    try {
        const movie = await Movie.findByIdAndDelete(req.params.id);
        if (!movie) return res.status(404).json({ error: "Movie not found" });
        res.json({ message: "Movie deleted" });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};



exports.searchMovies = async (req, res) => {
    try {
        const { title, director, genre } = req.query;
        const query = {};

        // Build query with case-insensitive partial matching
        if (title) {
            query.title = { $regex: new RegExp(escapeRegex(title), "i") };
        }
        if (director) {
            query.director = { $regex: new RegExp(escapeRegex(director), "i") };
        }
        if (genre) {
            // Handle comma-separated genres
            const genres = genre.split(',').map(g => escapeRegex(g.trim()));
            query.genre = { $regex: new RegExp(genres.join('|'), "i") };
        }

        const movies = await Movie.find(query);
        
        if (movies.length === 0) {
            return res.status(200).json({ 
                message: "No movies found matching the search criteria",
                data: [] 
            });
        }

        res.json({
            count: movies.length,
            data: movies
        });
    } catch (error) {
        console.error("Search error:", error);
        res.status(500).json({ 
            error: "An error occurred while searching movies",
            details: error.message 
        });
    }
};

exports.filterMovies = async (req, res) => {
    try {
        const { rating, genre, yearFrom, yearTo } = req.query;
        const query = {};

        // Handle rating filter with validation
        if (rating) {
            const ratingValue = parseFloat(rating);
            if (isNaN(ratingValue) || ratingValue < 0 || ratingValue > 10) {
                return res.status(400).json({ 
                    error: "Invalid rating value. Must be between 0 and 10" 
                });
            }
            query.rating = { $gte: ratingValue };
        }

        // Handle genre filter with multiple genres support
        if (genre) {
            const genres = genre.split(',').map(g => g.trim());
            query.genre = { $in: genres };
        }

        // Handle release year range
        if (yearFrom || yearTo) {
            query.releaseDate = {};
            if (yearFrom) {
                const fromDate = new Date(yearFrom, 0, 1);
                if (isNaN(fromDate.getTime())) {
                    return res.status(400).json({ error: "Invalid yearFrom value" });
                }
                query.releaseDate.$gte = fromDate;
            }
            if (yearTo) {
                const toDate = new Date(yearTo, 11, 31);
                if (isNaN(toDate.getTime())) {
                    return res.status(400).json({ error: "Invalid yearTo value" });
                }
                query.releaseDate.$lte = toDate;
            }
        }

        const movies = await Movie.find(query);

        res.json({
            count: movies.length,
            filters: {
                rating: rating || 'none',
                genre: genre || 'none',
                yearRange: (yearFrom || yearTo) ? `${yearFrom || 'any'} - ${yearTo || 'any'}` : 'none'
            },
            data: movies
        });
    } catch (error) {
        console.error("Filter error:", error);
        res.status(500).json({ 
            error: "An error occurred while filtering movies",
            details: error.message 
        });
    }
};

exports.sortMovies = async (req, res) => {
    try {
        const { sortBy = 'title', order = 'asc' } = req.query;
        
        // Validate sort field
        const validSortFields = ['title', 'rating', 'releaseDate', 'director'];
        if (!validSortFields.includes(sortBy)) {
            return res.status(400).json({ 
                error: `Invalid sort field. Must be one of: ${validSortFields.join(', ')}` 
            });
        }

        // Validate sort order
        const validOrders = ['asc', 'desc'];
        if (!validOrders.includes(order.toLowerCase())) {
            return res.status(400).json({ 
                error: "Invalid sort order. Must be 'asc' or 'desc'" 
            });
        }

        const sortOrder = order.toLowerCase() === 'asc' ? 1 : -1;
        const movies = await Movie.find()
            .sort({ [sortBy]: sortOrder })
            .exec();

        res.json({
            count: movies.length,
            sortBy,
            order,
            data: movies
        });
    } catch (error) {
        console.error("Sort error:", error);
        res.status(500).json({ 
            error: "An error occurred while sorting movies",
            details: error.message 
        });
    }
};