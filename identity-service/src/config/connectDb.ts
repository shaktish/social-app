import mongoose from "mongoose";
import config from "./config";
import logger from "../utils/logger";

const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const connectDb = async function (
  retries: number = 3,
  delay: number = 3000, 
): Promise<void> {
  try {
    await mongoose.connect(config.MONGO_CONNECTION_URL);
    logger.info("MongoDB connected successfully");
  } catch (e: unknown) {
    if (e instanceof Error) {
      logger.error("MongoDB connection error:", e.message);
    } else {
      logger.error("Unknown connection error:", e);
    }
    
    if (retries === 0) {
      logger.error("Exhausted retries. Exiting.");
      process.exit(1);
    } else {
      logger.info(`Retrying in ${delay} ms... Retries left: ${retries}`);
      await wait(delay);
      await connectDb(retries - 1, delay);
    }
  }
};

export default connectDb;
