import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  // Use Clerk user ID as the primary key so it's a string, not an ObjectId
  _id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  image: {
    type: String,
    default: "",
  },
});

const User = mongoose.model("User", userSchema);
export default User;