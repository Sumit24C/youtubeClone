import mongoose from "mongoose";
import { DB_CONFIG } from ".././config/db.config.js";

const connectDB = async (): Promise<void> => {
  try {
    if (!DB_CONFIG.uri) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    const connectionInstance = await mongoose.connect(
      `${DB_CONFIG.uri}/${DB_CONFIG.name}`
    );

    console.log(
      `MongoDB connected || DB HOST: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.error("MongoDB Connection Failed:", error);
    process.exit(1);
  }
};

export default connectDB;