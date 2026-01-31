import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/db.js";
import { clerkMiddleware } from '@clerk/express'
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js"
import { handleClerkWebhook } from "./routes/webhook.js";

import showRouter from "./routes/showRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import userRouter from "./routes/userRoutes.js";


import { clerkClient } from "@clerk/express";
import { stripeWebhooks } from "./controllers/stripeWebhooks.js";

const app = express();

const PORT = process.env.PORT || 3001;

// CORS configuration - allow requests from frontend
// For development, allow all origins. In production, restrict to specific domains.
const corsOptions = {
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With', 'Origin'],
  exposedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Clerk webhook endpoint - must be before JSON parsing middleware
// Webhook needs raw body for signature verification
app.post("/api/webhooks/clerk", express.raw({ type: 'application/json' }), handleClerkWebhook);

app.use(express.json());

// Make-admin endpoint - must be accessible without auth for initial setup
// Place it before Clerk middleware to avoid any authentication interference

// Handle OPTIONS preflight for make-admin endpoint
app.options("/api/internal/make-admin", cors(corsOptions), (req, res) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With, Origin');
    res.sendStatus(204);
});

app.post("/api/internal/make-admin", cors(corsOptions), async (req, res) => {
    // Set CORS headers explicitly
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With, Origin');

    try {
        const { userId, secretKey } = req.body;

        if (!userId) {
            return res.status(400).json({ success: false, message: "userId is required" });
        }

        // Optional: Add secret key protection (set ADMIN_SECRET_KEY in .env)
        // If ADMIN_SECRET_KEY is set, require it. Otherwise, allow open access for initial setup.
        if (process.env.ADMIN_SECRET_KEY) {
            if (!secretKey || secretKey !== process.env.ADMIN_SECRET_KEY) {
                return res.status(401).json({ 
                    success: false, 
                    message: "Invalid secret key" 
                });
            }
        }

        console.log("Making user admin:", userId);
        console.log("Using Clerk secret:", process.env.CLERK_SECRET_KEY?.slice(0, 10));

        await clerkClient.users.updateUser(userId, {
            privateMetadata: {
                role: "admin",
            },
        });

        res.json({
            success: true,
            message: "User promoted to admin",
        });
    } catch (err) {
        console.error("Error making user admin:", err);
        res.status(500).json({ 
            success: false,
            error: err.message 
        });
    }
});

// Clerk middleware - configure it to process auth tokens
// Make sure CLERK_SECRET_KEY is set in environment variables
if (!process.env.CLERK_SECRET_KEY) {
    console.warn("WARNING: CLERK_SECRET_KEY not set. Authentication may not work.");
}

// Clerk middleware processes Authorization headers and sets req.auth()
// It allows requests without auth (for public routes) but validates tokens when present
app.use(clerkMiddleware({
    // Clerk will automatically use CLERK_SECRET_KEY from environment
    // This allows public routes while still validating tokens for protected routes
}));

// Inngest endpoint must be registered before catch-all routes
// Inngest needs to handle GET, POST, PUT requests
// Use app.all to handle all HTTP methods
const inngestHandler = serve({ client: inngest, functions });
app.all("/api/inngest", (req, res, next) => {
    console.log(`Inngest request: ${req.method} ${req.path}`);
    return inngestHandler(req, res, next);
});

// Health check endpoint
app.get("/api/health", async (req, res) => {
    try {
        const mongoose = (await import("mongoose")).default;
        const dbStatus = mongoose.connection.readyState;
        const dbStates = {
            0: "disconnected",
            1: "connected",
            2: "connecting",
            3: "disconnecting"
        };
        
        res.json({ 
            status: "ok", 
            timestamp: new Date().toISOString(),
            database: {
                status: dbStates[dbStatus] || "unknown",
                readyState: dbStatus
            }
        });
    } catch (error) {
        res.status(500).json({ 
            status: "error", 
            error: error.message 
        });
    }
});

// Debug endpoint to check auth status
app.get("/api/debug/auth", (req, res) => {
    try {
        const authHeader = req.headers.authorization || req.headers.Authorization;
        const hasAuthHeader = !!authHeader;
        
        let auth;
        let authError = null;
        try {
            auth = req.auth();
        } catch (err) {
            authError = err.message;
        }
        
        res.json({
            authenticated: !!auth && !!auth.userId,
            userId: auth?.userId || null,
            sessionId: auth?.sessionId || null,
            hasAuthHeader: hasAuthHeader,
            authHeader: authHeader ? `${authHeader.split(' ')[0]} ...${authHeader.slice(-10)}` : null,
            authError: authError,
            allHeaders: Object.keys(req.headers).filter(h => h.toLowerCase().includes('auth')),
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Root endpoint - only match exact "/" path, not all routes
app.get("/", (req, res) => {
    res.send("Hello from server");
})

// Handle OPTIONS preflight for all API routes using middleware
app.use("/api", (req, res, next) => {
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With, Origin');
        return res.sendStatus(204);
    }
    next();
});

app.use("/api/stripe", express.raw({ type: 'application/json' }), stripeWebhooks);
app.use("/api/show", showRouter);
app.use("/api/booking", bookingRouter);
app.use("/api/admin", adminRouter);
app.use("/api/user", userRouter);

// Connect to database
// In serverless environments, connection happens on first request
// But we can try to connect early for better error visibility
if (process.env.VERCEL !== "1") {
    // Only connect immediately in non-serverless environments
    connectDB().catch(err => {
        console.error("Failed to connect to database:", err);
    });
} else {
    // In Vercel, log that connection will happen on first request
    console.log("Vercel environment detected - MongoDB will connect on first request");
}

// Only listen on PORT if not in serverless environment (Vercel)
if (process.env.VERCEL !== "1") {
    app.listen(PORT, () => {
        console.log(`Server is running on PORT: ${PORT}`);
    });
}

// Export for Vercel serverless functions
export default app;