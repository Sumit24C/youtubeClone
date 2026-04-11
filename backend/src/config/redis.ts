import { Redis } from "ioredis";

console.log(process.env.REDIS_PORT);

export const redisConnection = new Redis({
    host: process.env.REDIS_HOST!,
    port: Number(process.env.REDIS_PORT!),
    username: "default",
    password: process.env.REDIS_PASSWORD!,
    // tls: {},
    maxRetriesPerRequest: null,
});
