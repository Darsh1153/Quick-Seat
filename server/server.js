import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/db.js";
import { clerkMiddleware } from '@clerk/express'
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js"
import { handleClerkWebhook } from "./routes/webhook.js";

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());

// Clerk webhook endpoint - must be before JSON parsing middleware
// Webhook needs raw body for signature verification
app.post("/api/webhooks/clerk", express.raw({ type: 'application/json' }), handleClerkWebhook);

app.use(express.json());
app.use(clerkMiddleware())

// Inngest endpoint must be registered before catch-all routes
app.use("/api/inngest", serve({ client: inngest, functions }));

app.use("/", (req, res) => {
    res.send("Hello from server");
})

// Connect to database
connectDB().catch(err => {
    console.error("Failed to connect to database:", err);
});

// Only listen on PORT if not in serverless environment (Vercel)
if (process.env.VERCEL !== "1") {
    app.listen(PORT, () => {
        console.log(`Server is running on PORT: ${PORT}`);
    });
}

// Export for Vercel serverless functions
export default app;