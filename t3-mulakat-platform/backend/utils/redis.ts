import { createClient, RedisClientType } from 'redis';

export function redisConnectionStr() {
    const { REDIS_HOST, REDIS_PORT, REDIS_USERNAME, REDIS_PASSWORD } = process.env;

    let credentials = '';
    if (REDIS_USERNAME && REDIS_PASSWORD) {
        credentials = `${REDIS_USERNAME}:${REDIS_PASSWORD}@`;
    }

    const redisConnectionStr = `redis://${credentials}${REDIS_HOST}:${REDIS_PORT}`;
    console.log(`Redis Connection String: ${redisConnectionStr}`);
    return redisConnectionStr;
}

class RedisClient {
    private static instance: RedisClient;
    private client: RedisClientType;
    private subscriber: RedisClientType;
    private publisher: RedisClientType;

    constructor() {
        if (!RedisClient.instance) {
            this.client = createClient({
                url: redisConnectionStr()
            });
            this.subscriber = this.client.duplicate();
            this.publisher = this.client.duplicate();

            this.client.on('error', (err) => console.log('Redis Client Error', err));
            this.client.on('connect', () => console.log('Redis Client Connected'));
            this.subscriber.on('error', (err) => console.log('Redis Subscriber Error', err));
            this.subscriber.on('connect', () => console.log('Redis Subscriber Connected'));
            this.publisher.on('error', (err) => console.log('Redis Publisher Error', err));
            this.publisher.on('connect', () => console.log('Redis Publisher Connected'));
            this.client.connect();
            this.subscriber.connect();
            this.publisher.connect();

            RedisClient.instance = this;
        }

        return RedisClient.instance;
    }
    
    getClient() {
        return this.client;
    }
    getSubscriber() {
        return this.subscriber;
    }
    getPublisher() {
        return this.publisher;
    }
}
console.log("Redis Client Initialized")

const redisInstance = new RedisClient();

export const redisSubscriber = redisInstance.getSubscriber();
export const redisPublisher = redisInstance.getPublisher();

export default redisInstance.getClient();
