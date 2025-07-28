import Redis from "ioredis";
import logger from "./logger";
import config from "../config/config";

const redisHealthChecker = async (client: Redis) => {
  try {
    const res = await client.ping();

    if (res === "PONG") {
      logger.info(`✅ Redis is running at ${config.redisUrl}`);
    } else {
      logger.warn(`⚠️ Redis ping responded unexpectedly: ${res}`);
    }
  } catch (e) {
    logger.error(`❌ Redis connection failed: ${(e as Error).message}`);
  }
};

export default redisHealthChecker;