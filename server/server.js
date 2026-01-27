import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/db.js";
import { clerkMiddleware } from '@clerk/express'
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js"

const app = express();

const PORT = 3000;

app.use(express.json());
app.use(cors());
app.use(clerkMiddleware())

app.use("/", (req, res) => {
    res.send("Hello from server");
})

app.use("/api/inngest", serve({ client: inngest, functions }));

await connectDB();

app.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}`);
})