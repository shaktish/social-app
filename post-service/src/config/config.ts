import dotenv from 'dotenv';

dotenv.config();

interface Config {
    port : string;
    mongoConnectionUrl: string;
    jwtSecret: string;
    env: string,
    redisUrl : string,
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
  port: getEnvVar('PORT'),
  mongoConnectionUrl: getEnvVar('MONGO_CONNECTION_URL'),
  jwtSecret: getEnvVar('JWT_SECRET'),
  env: getEnvVar('NODE_ENV'),
  redisUrl: getEnvVar('REDIS_URL'),
  rabbitMQUrl:getEnvVar("RABBITMQ_URL")
};


export default config;