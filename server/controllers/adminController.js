import { clerkClient } from "@clerk/express";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import User from "../models/User.js";

// API to check if user is admin or not
export const isAdmin = async (req, res) => {
    res.json({ success: true, isAdmin: true });
}

// API to get dashboard data
export const getDashboardData = async (req, res) => {
    try {
        const bookings = await Booking.find({ isPaid: true });
        const activeShow = await Show.find({ showDateTime: { $gte: new Date() } }).populate("movie");
        const totalUser = await User.countDocuments();

        const dashboardData = {
            totalBookings: bookings.length,
            totalRevenue: bookings.reduce((acc, booking) => booking.amount + acc, 0),
            activeShow,
            totalUser,
        }
        res.json({ success: true, dashboardData });
    } catch (err) {
        res.json({success: false, message: err.message});
    }
}

// API to get all shows
export const getAllShows = async (req, res) => {
    try {
        const shows = await Show.find({showDateTime: {$gte: new Date()}}).populate("movie").sort({showDateTime: 1});
        res.json({success: true, shows});
    } catch (err) {
        res.json({success: false, message: err.message});
    }
}

// API to get all bookings
export const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({})
        .populate("user")
        .populate({
            path: "show",
            populate: {path: "movie"}
        }).sort({createdAt: -1});
        res.json({success: true, bookings});
    } catch (err) {
        res.json({success: false, message: err.message});
    }
}