import mongoose from "mongoose";
import logger from "../utils/logger.js";

async function dbConnection() {
  try {
    const uri = String(process.env.MONGO_URL);

    if (!uri) {
      throw new Error("MONGO_URL is not defined");
    }

    const connect = await mongoose.connect(uri, {
      dbName: "shoplus",
      tls: true,
    });

    logger.info(
      `MongoDB connected: ${connect.connection.host}, ${connect.connection.readyState}`,
    );
  } catch (error) {
    logger.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
}

export default dbConnection;
