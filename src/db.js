import mongoose, { connect } from "mongoose";

export const connectDB = async () => {
  try {
    mongoose.connect("mongodb://localhost/merndb");
    console.log(">>> DB is connected");
  } catch (error) {
    console.log(error);
  }
};
