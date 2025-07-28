import logger from "./logger";

const isServiceRunning = async (URL: string, serviceName: string) => {
  try {
    const res = await fetch(`${URL}/health`);
    if (res.ok) {
      logger.info(`✅ ${serviceName} is running on ${URL}`);
    } else {
      logger.warn(`⚠️ ${serviceName} responded with status ${res.status}`);
    }
  } catch (e) {
    logger.error(`❌ ${serviceName} is DOWN — ${(e as Error).message}`);
  }
};

export default isServiceRunning;
