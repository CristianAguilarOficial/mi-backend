import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost/merndb"
    );
    console.log(">>> DB is connected");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
  }
};
