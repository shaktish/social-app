import dotenv from "dotenv";

dotenv.config();

interface Config {
  port: string;
  mongoConnectionUrl: string;
  jwtSecret: string;
  env: string;
  redisUrl: string;
  cloudinaryUrl : string;
  cloudinaryCloudName : string;
  cloudinaryApiKey : string;
  cloudinaryApiSecret : string;
  rabbitMQUrl : string,
}

function getEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

const config: Config = {
  port:getEnvVar("PORT"),
  mongoConnectionUrl: getEnvVar("MONGO_CONNECTION_URL"),
  jwtSecret: getEnvVar("JWT_SECRET"),
  env: getEnvVar("NODE_ENV"),
  redisUrl: getEnvVar("REDIS_URL"),
  cloudinaryUrl : getEnvVar("CLOUDINARY_URL"),
  cloudinaryCloudName : getEnvVar("CLOUDINARY_CLOUD_NAME"),
  cloudinaryApiKey : getEnvVar("CLOUDINARY_API_KEY"),
  cloudinaryApiSecret : getEnvVar("CLOUDINARY_API_Secret"),
  rabbitMQUrl:getEnvVar("RABBITMQ_URL")
};

export default config;
