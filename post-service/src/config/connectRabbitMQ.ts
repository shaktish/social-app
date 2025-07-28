import amqp from "amqplib";
import config from "./config";
import logger from "../utils/logger";

const EXCHANGE_NAME = "facebook_events";
let channel: amqp.Channel | null = null;

export async function connectRabbitMQ() {
  try {
    const connection = await amqp.connect(config.rabbitMQUrl);
    channel = await connection.createChannel();
    await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: true });    

    channel.on("error", (err) => {
      logger.error("RabbitMQ channel error:", err);
    });
    channel.on("close", () => {
      logger.warn("RabbitMQ channel closed");
    });
    connection.on("close", () => {
      logger.warn("RabbitMQ connection closed");
    });

    logger.info(`Connected to RabbitMQ`);
  } catch (e) {
    logger.error(`Failed to connect to RabbitMQ`, e);
    channel=null;
    process.exit(1);
    
  }
}

export async function publishEvent(routingKey: string, message: any) {
  if (!channel) {
    await connectRabbitMQ();
  }
  if (!channel) {
    throw new Error("RabbitMQ channel not available after connection");
  }
  channel.publish(
    EXCHANGE_NAME,
    routingKey,
    Buffer.from(JSON.stringify(message))
  );
  logger.info(`Event published: ${routingKey}`);
}
