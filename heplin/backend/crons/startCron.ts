import telegramBot from '@/functions/telegramBot/telegramBot';
import { redisConnectionStr } from '@/utils/redis';
import axios from 'axios';
import Redis from 'ioredis';
import cron from 'node-cron'
import Leader from 'redis-leader';
export async function startCrons() {
    const redisStr = redisConnectionStr()
    const { REDIS_HOST, REDIS_PORT, REDIS_USERNAME, REDIS_PASSWORD } = process.env;


    const redis = new Redis({
        host: REDIS_HOST,
        port: parseInt(REDIS_PORT),
        username: REDIS_USERNAME,
        password: REDIS_PASSWORD
    });
    console.log(redisStr, 'Redis Connection String crons');

    const leader = new Leader(redis, "heplin-backend-leader", {
        ttl: 10000,
        renew: true,
    });
    leader.on("elected", () => {
        console.log(`[${new Date().toISOString()}] 🏆 Leader Elected`);
        cron.schedule('0 0 23 * * *', async () => {
            const cronStartTime = Date.now();
            console.log(`[${new Date().toISOString()}] checkJobEndDateCronJob started`);
            try {
                const response = await axios.patch(process.env.URL + "/api/v1/checkJobEndDateCronJob");
                console.log(`[${new Date().toISOString()}] checkJobEndDateCronJob completed in ${Date.now() - cronStartTime}ms:`, response.data);
            } catch (error) {
                console.error(`[${new Date().toISOString()}] checkJobEndDateCronJob failed after ${Date.now() - cronStartTime}ms:`, error);
            }
        });

        cron.schedule('0 0 18 * * *', async () => {
            const cronStartTime = Date.now();
            console.log(`[${new Date().toISOString()}] sendDisqualifyMailCronJob started`);
            try {
                const response = await axios.patch(process.env.URL + "/api/v1/sendDisqualifyMailCronJob");
                console.log(`[${new Date().toISOString()}] sendDisqualifyMailCronJob completed in ${Date.now() - cronStartTime}ms:`, response.data);
            } catch (error) {
                console.error(`[${new Date().toISOString()}] sendDisqualifyMailCronJob failed after ${Date.now() - cronStartTime}ms:`, error);
            }
        });

        cron.schedule('*/1 * * * *', async () => {
            const cronStartTime = Date.now();
            console.log(`[${new Date().toISOString()}] parseMailCronJob started`);
            try {
                const response = await axios.patch(process.env.URL + "/api/v1/parseMailCronJob");
                console.log(`[${new Date().toISOString()}] parseMailCronJob completed in ${Date.now() - cronStartTime}ms:`, response.data);
            } catch (error) {
                console.error(`[${new Date().toISOString()}] parseMailCronJob failed after ${Date.now() - cronStartTime}ms:`, error);
            }
        });
        const cronSetupStartTime = Date.now();
        console.log(`[${new Date().toISOString()}] Cron jobs setup started`);
        console.log(`[${new Date().toISOString()}] Cron jobs setup completed in ${Date.now() - cronSetupStartTime}ms`);
    })
    leader.on("error", (err) => {
        console.error(`[${new Date().toISOString()}] ❌ Leader Election Error:`, err.message);
    });
}

export async function TelegramBotNode(app: any) {
    const redisStr = redisConnectionStr()
    const { REDIS_HOST, REDIS_PORT, REDIS_USERNAME, REDIS_PASSWORD } = process.env;


    const redis = new Redis({
        host: REDIS_HOST,
        port: parseInt(REDIS_PORT),
        username: REDIS_USERNAME,
        password: REDIS_PASSWORD
    });
    console.log(redisStr, 'Redis Connection String crons telegram');

    const leader = new Leader(redis, "heplin-backend-leader", {
        ttl: 10000,
        renew: true,
    });

    leader.on("elected", async () => {
        const telegramBotStartTime = Date.now();
        console.log(`[${new Date().toISOString()}] Telegram bot initialization started`);
        try {
            await telegramBot(app.context);
        }
        catch (error) {
            console.error(`[${new Date().toISOString()}] Telegram bot initialization failed:`);
            throw error;
        }
        console.log(`[${new Date().toISOString()}] Telegram bot initialization completed in ${Date.now() - telegramBotStartTime}ms`);
    })
    leader.on("error", (err) => {
        console.error(`[${new Date().toISOString()}] ❌ Leader Election Error: telegram`, err.message);
    });


}

export function WhatsappBotNode() {
    
}