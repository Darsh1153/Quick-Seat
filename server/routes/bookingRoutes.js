import express from "express";
import { createBooking, getOccupiedSeat } from "../controllers/bookingController.js";

const bookingRouter = express.Router();


bookingRouter.post("/create", createBooking);
bookingRouter.get("/seats/:showId", getOccupiedSeat);

export default bookingRouter;