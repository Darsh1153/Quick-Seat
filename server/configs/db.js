import mongoose from "mongoose";

const connectDB = async () => {
    try {
        // Check if already connected
        if (mongoose.connection.readyState === 1) {
            console.log("MongoDB already connected");
            return;
        }
        
        // Check if connection is in progress
        if (mongoose.connection.readyState === 2) {
            console.log("MongoDB connection in progress, waiting...");
            await new Promise((resolve) => {
                mongoose.connection.once('connected', resolve);
            });
            return;
        }
        
        mongoose.connection.on("connected", () => console.log("Server connected with mongodb"));
        mongoose.connection.on("error", (err) => console.error("MongoDB connection error:", err));
        mongoose.connection.on("disconnected", () => console.log("MongoDB disconnected"));
        
        // Get the connection string
        const databaseUri = process.env.DATABASE_URI;
        
        if (!databaseUri) {
            throw new Error("DATABASE_URI environment variable is not set");
        }
        
        console.log("Attempting to connect to MongoDB...");
        console.log("Connection string (masked):", databaseUri.replace(/:[^:@]+@/, ':****@'));
        
        // Connect to MongoDB - specify database name in options if not in URI
        const connectionOptions = {
            dbName: 'quickseat',
            retryWrites: true,
            w: 'majority'
        };
        
        await mongoose.connect(databaseUri, connectionOptions);
        console.log("MongoDB connected successfully to database: quickseat");
    } catch(err){
        console.error("MongoDB connection failed:", err.message);
        console.error("Full error:", err);
        throw err; // Re-throw to allow Inngest to retry
    }
}

export default connectDB;