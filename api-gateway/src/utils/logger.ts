import winston, { Logger } from "winston";
import config from "../config/config";

const logger: Logger = winston.createLogger({
  level: config.env === "production" ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp(), // log with time 
    winston.format.errors({ stack: true }), 
    winston.format.splat(), // enables for msg templating
    winston.format.json() 
  ),
  defaultMeta: { service: "api-gateway" },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    new winston.transports.File({filename : 'error.log', level: 'error'}),
    new winston.transports.File({filename : 'combined.log'})
  ],
});

export default logger;