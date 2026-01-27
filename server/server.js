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
// Inngest needs to handle GET, POST, PUT requests
// Use app.all to handle all HTTP methods
const inngestHandler = serve({ client: inngest, functions });
app.all("/api/inngest", (req, res, next) => {
    console.log(`Inngest request: ${req.method} ${req.path}`);
    return inngestHandler(req, res, next);
});

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Root endpoint - only match exact "/" path, not all routes
app.get("/", (req, res) => {
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