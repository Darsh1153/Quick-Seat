import { clerkClient } from "@clerk/express";
import Booking from "../models/Booking.js";
import Movie from "../models/Movie.js";

// API controller function to get user bookings
export const getUserBookings = async (req, res) => {
    try {
        const userId = req.auth().userId;
        
        console.log("[getUserBookings] Fetching bookings for user:", userId);

        const bookings = await Booking.find({ user: userId })
            .populate({
                path: "show",
                populate: { path: "movie" }
            }).sort({ createdAt: -1 });

        console.log("[getUserBookings] Found bookings:", {
            count: bookings.length,
            bookings: bookings.map(b => ({
                id: b._id,
                showId: b.show?._id,
                movieTitle: b.show?.movie?.title,
                amount: b.amount,
                bookedSeats: b.bookedSeats
            }))
        });

        res.json({ success: true, bookings });
    } catch (err) {
        console.error("[getUserBookings] Error:", err);
        res.json({ success: false, message: err.message });
    }
}

// API controller function to update favorites movie in clerk user metadata
export const updateFavorites = async (req, res) => {
    try {
        const { movieId } = req.body;
        const userId = req.auth().userId;

        const user = await clerkClient.users.getUser(userId);

        if (!user.privateMetadata.favorites) {
            user.privateMetadata.favorites = [];
        }
        if (!user.privateMetadata.favorites.includes(movieId)) {
            user.privateMetadata.favorites.push(movieId);
        } else {
            user.privateMetadata.favorites = user.privateMetadata.favorites.filter(item => item !== movieId);
        }
        await clerkClient.users.updateUserMetadata(userId, { privateMetadata: user.privateMetadata });
        res.json({ success: true, message: "Favorite updated successfully!" });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
}

export const getFavorites = async (req, res) => {
    try {
        const user = await clerkClient.users.getUser(req.auth().userId);
        const favorites = user.privateMetadata.favorites;

        // getting movies from DB
        const movies = await Movie.find({_id: {$in: favorites}})
        res.json({ success: true, movies });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
}