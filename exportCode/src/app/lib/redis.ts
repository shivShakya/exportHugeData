import { Queue } from "bullmq";
import IORedis from "ioredis";

export const connection = new IORedis(
  "redis://default:8qLA2PNCF2w2p5AG04AmvJ5W7DdBteUH@redis-13330.c273.us-east-1-2.ec2.cloud.redislabs.com:13330",
  {
    maxRetriesPerRequest: null, 
  }
);

export const exportQueue = new Queue("exportQueue", {
  connection,
  defaultJobOptions: {
    removeOnComplete: false,
    removeOnFail: false,
  },
});

