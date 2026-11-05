import rateLimit from 'koa-ratelimit';
import Redis from 'ioredis';

const { REDIS_HOST, REDIS_PORT, REDIS_USERNAME, REDIS_PASSWORD } = process.env

export const rateLimiterMiddleware = rateLimit({
    driver: "redis",
    db: new Redis({
        host: REDIS_HOST,
        port: parseInt(REDIS_PORT),
        username: REDIS_USERNAME,
        password: REDIS_PASSWORD
    }), // Redis client instance
    duration: 60000, // 1 minute window
    max: 250, // Max requests per minute
    id: (ctx) => ctx.ip, // Identify users by IP address
    headers: {
        remaining: 'X-RateLimit-Remaining',
        reset: 'X-RateLimit-Reset',
        total: 'X-RateLimit-Limit',
    },
})
