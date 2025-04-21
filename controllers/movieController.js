const mongoose = require('mongoose');
const Movie = require('../Movies.js');

// Get all movies with average rating (sorted)
exports.getMovies = async (req, res) => {
    try {
        const aggregate = [
            {
                $lookup: {
                    from: 'reviews',
                    localField: '_id',
                    foreignField: 'movieId', // FIXED spelling
                    as: 'movieReviews'
                }
            },
            {
                $addFields: {
                    avgRating: { $avg: '$movieReviews.rating' }
                }
            },
            {
                $sort: { avgRating: -1 }
            }
        ];
        const movies = await Movie.aggregate(aggregate);
        res.status(200).json({ success: true, data: movies });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get a movie by ID with aggregated reviews and rating
exports.getMovie = async (req, res) => {
    try {
        const movieId = new mongoose.Types.ObjectId(req.params.id);
        const aggregate = [
            { $match: { _id: movieId } },
            {
                $lookup: {
                    from: 'reviews',
                    localField: '_id',
                    foreignField: 'movieId', // FIXED spelling
                    as: 'movieReviews'
                }
            },
            {
                $addFields: {
                    avgRating: { $avg: '$movieReviews.rating' }
                }
            }
        ];
        const movie = await Movie.aggregate(aggregate);
        if (!movie || movie.length === 0) {
            return res.status(404).json({ success: false, message: 'Movie not found.' });
        }
        res.status(200).json({ success: true, data: movie[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Create a new movie (supporting imageUrl)
exports.createMovie = async (req, res) => {
    try {
        const { title, releaseDate, genre, actors, imageUrl } = req.body;
        if (!actors || actors.length === 0) {
            return res.status(400).json({ success: false, message: 'Actors are required' });
        }
        const newMovie = new Movie({ title, releaseDate, genre, actors, imageUrl });
        await newMovie.save();
        res.status(201).json({ success: true, data: newMovie });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// Update a movie
exports.updateMovie = async (req, res) => {
    try {
        const updatedMovie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedMovie) return res.status(404).json({ success: false, message: 'Movie not found' });
        res.status(200).json({ success: true, data: updatedMovie });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// Delete a movie
exports.deleteMovie = async (req, res) => {
    try {
        const deletedMovie = await Movie.findByIdAndDelete(req.params.id);
        if (!deletedMovie) return res.status(404).json({ success: false, message: 'Movie not found' });
        res.status(200).json({ success: true, message: 'Movie deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Extra Credit: Search by title or actor name (partial match)
exports.searchMovies = async (req, res) => {
    try {
        const query = req.body.query;
        const regex = new RegExp(query, 'i');
        const results = await Movie.find({
            $or: [
                { title: regex },
                { 'actors.name': regex }
            ]
        });
        res.status(200).json({ success: true, data: results });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
