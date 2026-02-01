import express from "express";
import { createBooking, getOccupiedSeat, checkPaymentStatus } from "../controllers/bookingController.js";

const bookingRouter = express.Router();


bookingRouter.post("/create", createBooking);
bookingRouter.get("/seats/:showId", getOccupiedSeat);
bookingRouter.get("/check-payment/:bookingId", checkPaymentStatus);

export default bookingRouter;