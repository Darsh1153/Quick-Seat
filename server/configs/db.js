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
        
        await mongoose.connect(`${process.env.DATABASE_URI}/quickseat`);
    } catch(err){
        console.error("MongoDB not connected:", err.message);
        throw err; // Re-throw to allow Inngest to retry
    }
}

export default connectDB;