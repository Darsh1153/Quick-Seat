import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import Stripe from "stripe";

const checkSeatsAvailability = async (showId, selectedSeats) => {
    try {
        if (!selectedSeats || !Array.isArray(selectedSeats) || selectedSeats.length === 0) {
            console.error("Invalid selectedSeats:", selectedSeats);
            return false;
        }

        const showData = await Show.findById(showId);
        if (!showData) {
            console.error("Show not found for showId:", showId);
            return false;
        }

        const occupiedSeats = showData.occupiedSeats || {};

        // Check if any of the selected seats are already occupied
        const isSeatOccupied = selectedSeats.some(seat => occupiedSeats[seat]);
        if (isSeatOccupied) {
            console.log("At least one seat is already occupied:", selectedSeats);
            return false; // Seats are not available
        }
        
        return true; // All seats are available
    } catch (err) {
        console.error("Error in checkSeatsAvailability:", err);
        return false;
    }
}

export const createBooking = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { showId, selectedSeats } = req.body;
        const { origin } = req.headers;
        
        console.log("[createBooking] Request received:", {
            userId,
            showId,
            selectedSeats,
            selectedSeatsType: typeof selectedSeats,
            isArray: Array.isArray(selectedSeats),
            selectedSeatsLength: selectedSeats?.length
        });

        if (!showId) {
            return res.json({success: false, message: "Show ID is required"});
        }

        if (!selectedSeats || !Array.isArray(selectedSeats) || selectedSeats.length === 0) {
            return res.json({success: false, message: "Please select at least one seat"});
        }

        const isSeatAvailable = await checkSeatsAvailability(showId, selectedSeats);
        if(!isSeatAvailable) {
            return res.json({success: false, message: "Selected seats are not available"});
        }

        const showData = await Show.findById(showId).populate("movie");
        
        if (!showData) {
            return res.json({success: false, message: "Show not found"});
        }

        // creating a new booking
        console.log("[createBooking] Creating booking with:", {
            user: userId,
            show: showId,
            amount: showData.showPrice * selectedSeats.length,
            bookedSeats: selectedSeats
        });
        
        const booking = await Booking.create({
            user: userId,
            show: showId,
            amount: showData.showPrice * selectedSeats.length,
            bookedSeats: selectedSeats,
        });
        
        console.log("[createBooking] Booking created:", {
            bookingId: booking._id,
            booking: booking
        });
        
        // reserve the seat
        if (!showData.occupiedSeats) {
            showData.occupiedSeats = {};
        }
        
        selectedSeats.forEach((seat) => {
            showData.occupiedSeats[seat] = userId;
        });

        showData.markModified('occupiedSeats');

        await showData.save();
        
        console.log("[createBooking] Show updated with occupied seats");


        // Stripe payment gateway
        const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

        // creating line items to stripe
        const line_items = [{
            price_data: {
                currency: 'inr',
                product_data: {
                    name: showData.movie.title,
                },
                unit_amount: Math.floor(booking.amount) * 100,
            },
            quantity: 1,
        }]

        const session = await stripeInstance.checkout.sessions.create({
            success_url: `${origin}/loading/my-bookings`,
            cancel_url: `${origin}/my-boookings`,
            line_items: line_items,
            mode: "payment",
            metadata: {
                bookingId: booking._id.toString(),
            },
            expires_at: Math.floor(Date.now() / 1000) + 30 * 60 // Expires in 30 mins
        })

        booking.paymentLink = session.url
        await booking.save()

        res.json({success: true, url: session.url});
    } catch (err) {
        res.json({success: false, message: err.message});
    }
}


export const getOccupiedSeat = async (req, res) => {
    try {
        const {showId} = req.params;
        
        if (!showId) {
            return res.json({success: false, message: "Show ID is required"});
        }
        
        const showData = await Show.findById(showId);
        
        if (!showData) {
            return res.json({success: false, message: "Show not found"});
        }

        const occupiedSeats = showData.occupiedSeats ? Object.keys(showData.occupiedSeats) : [];

        res.json({success: true, occupiedSeats});
    } catch (err) {
        console.error("Error in getOccupiedSeat:", err);
        res.json({success: false, message: err.message || "Failed to fetch occupied seats"});
    }
}