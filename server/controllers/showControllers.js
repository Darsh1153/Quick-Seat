import { inngest } from "../inngest/index.js";
import Movie from "../models/Movie.js";
import Show from "../models/Show.js";

// API to get now playing movies in admin (add show dashboard)
export const getNowPlayingMovies = async (req, res) => {
    try {
        const data = await fetch("https://api.themoviedb.org/3/movie/now_playing", {
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${process.env.TMDB_API_KEY}`
            }
        });
        const movies = await data.json();
        
        // Transform poster_path to full URL
        const transformedMovies = movies.results.map(movie => ({
            ...movie,
            poster_path: movie.poster_path 
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
                : null
        }));
        
        res.json({ success: true, movies: transformedMovies });
    } catch (err) {
        console.error("Error fetching now playing movies:", err);
        res.json({ success: false, message: err.message });
    }
}

// API to add a new show
export const addShow = async (req, res) => {
    try {
        const { movieId, showInput, showPrice } = req.body;

        let movie = await Movie.findById(movieId);

        // ✅ Declare here (outer scope)
        const showToCreate = [];

        if (!movie) {
            const [movieRes, creditsRes] = await Promise.all([
                fetch(`https://api.themoviedb.org/3/movie/${movieId}`, {
                    headers: {
                        accept: "application/json",
                        Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
                    },
                }),
                fetch(`https://api.themoviedb.org/3/movie/${movieId}/credits`, {
                    headers: {
                        accept: "application/json",
                        Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
                    },
                }),
            ]);

            const movieDetails = await movieRes.json();
            const castDetails = await creditsRes.json();

            await Movie.create({
                _id: movieId,
                title: movieDetails.title,
                overview: movieDetails.overview,
                poster_path: movieDetails.poster_path,
                backdrop_path: movieDetails.backdrop_path,
                genres: movieDetails.genres,
                casts: castDetails.cast,
                release_date: movieDetails.release_date,
                original_language: movieDetails.original_language,
                tagline: movieDetails.tagline,
                vote_average: movieDetails.vote_average,
                runtime: movieDetails.runtime,
            });
        }

        // ✅ Always build shows (movie exists OR newly created)
        // Frontend sends: showInput = [{ date, time: ['HH:MM', 'HH:MM', ...] }, ...]
        showInput.forEach(show => {
            show.time.forEach(time => {
              // time comes in as "HH:MM" from <input type="time" | datetime-local>
              // Construct a proper ISO datetime string
              const dateTime = new Date(`${show.date}T${time}:00`);
          
              showToCreate.push({
                movie: movieId,
                showDateTime: dateTime,
                showPrice: Number(showPrice),
                occupiedSeats: {},
              });
            });
          });
          

        if (showToCreate.length) {
            await Show.insertMany(showToCreate);
        }

        // Trigger inngest event
        await inngest.send({
            name: "app/show.added",
            data: { movieTitle: movie.title },
        })

        res.json({ success: true, message: "Show added successfully!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// API to get all upcoming show with unique
export const getShows = async (req, res) => {
    try {
        const currentDate = new Date();
        console.log("[getShows] Fetching shows with date >= ", currentDate);
        
        const shows = await Show.find({showDateTime: {$gte: currentDate}}).populate("movie").sort({ showDateTime: 1 });

        console.log("[getShows] Found shows:", shows.length);

        // Filter unique movies by _id
        const uniqueMovieMap = new Map();
        shows.forEach(show => {
            if (show.movie && show.movie._id) {
                const movieId = show.movie._id.toString();
                if (!uniqueMovieMap.has(movieId)) {
                    uniqueMovieMap.set(movieId, show.movie);
                }
            }
        });

        const uniqueShows = Array.from(uniqueMovieMap.values());
        console.log("[getShows] Unique movies:", uniqueShows.length);
        res.json({ success: true, shows: uniqueShows });
    } catch (err) {
        console.error("Error fetching shows:", err);
        res.json({ success: false, message: err.message });
    }
}

// API to get one show from DB
export const getShow = async (req, res) => {
    try {
        const {movieId} = req.params;
        if (!movieId) {
            return res.json({ success: false, message: "Movie ID is required" });
        }

        const shows = await Show.find({ movie: movieId, showDateTime: {$gte: new Date()}});
        const movie = await Movie.findById(movieId);

        if (!movie) {
            return res.json({ success: false, message: "Movie not found" });
        }

        const dateTime = {};
        shows.forEach((showItem) => {
            const date = showItem.showDateTime.toISOString().split("T")[0];
            if(!dateTime[date]){
                dateTime[date] = [];
            }
            dateTime[date].push({ time: showItem.showDateTime, showId: showItem._id });
        });
        
        res.json({ success: true, movie, dateTime });
    } catch (err) {
        console.error("Error in getShow:", err);
        res.json({ success: false, message: err.message || "Failed to fetch show details" });
    }
}