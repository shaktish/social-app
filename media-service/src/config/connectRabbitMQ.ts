import amqp, { ConsumeMessage } from "amqplib";
import config from "./config";
import logger from "../utils/logger";
import { DeletePostEventData, handlePostDeleted } from "../event-handlers/mediaEventHandler";

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
export async function publishEvent(routingKey: string, message: string) {
  if (!channel) {
    await connectRabbitMQ();
  } else {
    channel.publish(
      EXCHANGE_NAME,
      routingKey,
      Buffer.from(JSON.stringify(message))
    );
    logger.info(`Event published: ${routingKey}`);
  }
}

export async function consumeEvent(
  routingKey: string,
  cb: (v: any) => void
) {
  if (!channel) {
    await connectRabbitMQ();
  }

  if (!channel) {
    throw new Error("RabbitMQ channel not available after connection");
  }

  const q = await channel.assertQueue("", { exclusive : true });
  await channel.bindQueue(q.queue, EXCHANGE_NAME, routingKey);
  channel.consume(q.queue, (msg: ConsumeMessage | null) => {
    if (msg) {
      console.log('media service msg received');
      const content : DeletePostEventData = JSON.parse(msg.content.toString());
      cb(content);
      channel?.ack(msg);
    }
  });
  logger.info(`Subscribed to event ${routingKey}`);
}

export async function startConsumer() {
  logger.info("startConsumer listening");
  await consumeEvent("post.deleted", handlePostDeleted);
}
