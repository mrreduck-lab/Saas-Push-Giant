import { Queue } from "bullmq";
import { Redis } from "ioredis";
import { CAMPAIGN_DELIVERY_QUEUE_NAME } from "@pushgiant/shared";

export type Queues = {
  connection: Redis;
  campaignDelivery: Queue;
  close(): Promise<void>;
};

export function createQueues(redisUrl: string): Queues {
  const connection = new Redis(redisUrl, {
    maxRetriesPerRequest: null
  });
  const queueConnection = {
    url: redisUrl,
    maxRetriesPerRequest: null
  };

  const campaignDelivery = new Queue(CAMPAIGN_DELIVERY_QUEUE_NAME, {
    connection: queueConnection,
    defaultJobOptions: {
      attempts: 5,
      backoff: {
        type: "exponential",
        delay: 30_000
      },
      removeOnComplete: 1_000,
      removeOnFail: 10_000
    }
  });

  return {
    connection,
    campaignDelivery,
    async close() {
      await campaignDelivery.close();
      connection.disconnect();
    }
  };
}
