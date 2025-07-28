import amqp, { ConsumeMessage } from "amqplib";
import config from "./config";
import logger from "../utils/logger";
import { CreatePostEventData, handleCreatePost, handlePostDeleted } from "../event-handlers/searchEventHandler";
import Redis from "ioredis";

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


export async function consumeEvent(
  routingKey: string,
  cb: (v: any, redisClient:Redis) => void,
  redisClient : Redis,
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
      logger.info('search service msg received');
      const content : CreatePostEventData = JSON.parse(msg.content.toString());
      cb(content, redisClient);
      channel?.ack(msg);
    }
  });
  logger.info(`Subscribed to event ${routingKey}`);
}


export async function startConsumer(redisClient:Redis) {
  logger.info("startConsumer listening");
  await consumeEvent("post.created", handleCreatePost,redisClient);
  await consumeEvent("post.deleted", handlePostDeleted,redisClient)
}