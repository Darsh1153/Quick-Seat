import mongoose from "mongoose";

const connectDB = async () => {
    try {
        mongoose.connection.on("connected", () => console.log("Server connected with mongodb"));
        await mongoose.connect(`${process.env.DATABASE_URI}/quickseat`);
    } catch(err){
        console.log("MongoDB not connected");
        console.log(err.message);
    }
}

export default connectDB;