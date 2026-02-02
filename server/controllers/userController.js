import { clerkClient } from "@clerk/express";
import Booking from "../models/Booking.js";
import Movie from "../models/Movie.js";
import Show from "../models/Show.js";

// API controller function to get user bookings
export const getUserBookings = async (req, res) => {
    try {
        const userId = req.auth().userId;
        
        console.log("[getUserBookings] Fetching bookings for user:", userId);

        let bookings = await Booking.find({ user: userId })
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

        // Clean up unpaid bookings older than 10 minutes (fallback in case Inngest doesn't run)
        const now = new Date();
        const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);

        const expiredBookings = bookings.filter(
            (b) => !b.isPaid && b.createdAt && b.createdAt < tenMinutesAgo
        );

        if (expiredBookings.length > 0) {
            console.log("[getUserBookings] Found expired unpaid bookings to clean up:", {
                count: expiredBookings.length,
                bookingIds: expiredBookings.map((b) => b._id),
            });

            for (const booking of expiredBookings) {
                try {
                    const showId = booking.show?._id || booking.show;
                    const show = showId ? await Show.findById(showId) : null;

                    if (!show) {
                        console.warn(
                            "[getUserBookings] Show not found while cleaning expired booking:",
                            { bookingId: booking._id, showId }
                        );
                    } else if (show.occupiedSeats && Array.isArray(booking.bookedSeats)) {
                        booking.bookedSeats.forEach((seat) => {
                            if (show.occupiedSeats[seat]) {
                                delete show.occupiedSeats[seat];
                            }
                        });
                        show.markModified("occupiedSeats");
                        await show.save();
                        console.log(
                            "[getUserBookings] Released seats for expired booking:",
                            booking._id
                        );
                    }

                    await Booking.findByIdAndDelete(booking._id);
                    console.log(
                        "[getUserBookings] Deleted expired unpaid booking:",
                        booking._id
                    );
                } catch (cleanupError) {
                    console.error(
                        "[getUserBookings] Error cleaning up expired booking:",
                        {
                            bookingId: booking._id,
                            error: cleanupError,
                            message: cleanupError.message,
                        }
                    );
                }
            }

            // Filter out expired bookings from the response without an extra DB round-trip
            bookings = bookings.filter(
                (b) => !expiredBookings.some((expired) => expired._id.equals(b._id))
            );
        }

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