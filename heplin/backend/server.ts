import "dotenv/config";
import bodyParser from 'koa-bodyparser';
import koa from 'koa';
import Morgan from 'koa-morgan';
import Helmet from 'koa-helmet';
import i18n from 'koa-i18n';
import Locale from 'koa-locale';
import { connectMongo } from './utils';
import { configRegistry, cors, errorHandling, rateLimiterMiddleware, redisSubscribe, serviceRegistry } from "./middlewares";
import { localUpload } from "./middlewares/localUpload";
import router from "./routes";
import telegramBot from "./functions/telegramBot/telegramBot";
import { startCrons, TelegramBotNode } from "./crons/startCron";

const port = process.env.PORT || 3000;
const enableTelegramBot = process.env.ENABLE_TELEGRAM_BOT !== "false";
const enableCrons = process.env.ENABLE_CRONS !== "false";

const app = new koa<{}, Context>();
app.context.stop = () => true; // When this function is called, the middleware chain will stop.

const serverStartTime = Date.now();
console.log(`[${new Date().toISOString()}] Server initialization started`);

const mongoStartTime = Date.now();
console.log(`[${new Date().toISOString()}] MongoDB connection started`);

connectMongo().then(async () => {
    const mongoEndTime = Date.now();
    console.log(`[${new Date().toISOString()}] MongoDB connection completed in ${mongoEndTime - mongoStartTime}ms`);

    const localeStartTime = Date.now();
    console.log(`[${new Date().toISOString()}] Locale initialization started`);
    Locale(app);
    console.log(`[${new Date().toISOString()}] Locale initialization completed in ${Date.now() - localeStartTime}ms`);

    const rateLimiterStartTime = Date.now();
    console.log(`[${new Date().toISOString()}] Rate limiter initialization started`);
    app.use(rateLimiterMiddleware);
    console.log(`[${new Date().toISOString()}] Rate limiter initialization completed in ${Date.now() - rateLimiterStartTime}ms`);

    // Body parser süresini ölç
    const bodyParserStartTime = Date.now();
    console.log(`[${new Date().toISOString()}] Body parser initialization started`);
    app.use(bodyParser());
    console.log(`[${new Date().toISOString()}] Body parser initialization completed in ${Date.now() - bodyParserStartTime}ms`);

    // Morgan logger süresini ölç
    const morganStartTime = Date.now();
    console.log(`[${new Date().toISOString()}] Morgan logger initialization started`);
    app.use(Morgan('combined'));
    console.log(`[${new Date().toISOString()}] Morgan logger initialization completed in ${Date.now() - morganStartTime}ms`);

    // Helmet süresini ölç
    const helmetStartTime = Date.now();
    console.log(`[${new Date().toISOString()}] Helmet initialization started`);
    app.use(Helmet());
    console.log(`[${new Date().toISOString()}] Helmet initialization completed in ${Date.now() - helmetStartTime}ms`);

    // i18n süresini ölç
    const i18nStartTime = Date.now();
    console.log(`[${new Date().toISOString()}] i18n initialization started`);
    app.use(i18n(app, {
        directory: './config/locales',
        locales: ['en'],
        modes: [
            'header',
        ]
    }));
    console.log(`[${new Date().toISOString()}] i18n initialization completed in ${Date.now() - i18nStartTime}ms`);

    const errorHandlingStartTime = Date.now();
    console.log(`[${new Date().toISOString()}] Error handling initialization started`);
    await errorHandling(app);
    console.log(`[${new Date().toISOString()}] Error handling initialization completed in ${Date.now() - errorHandlingStartTime}ms`);

    const serviceRegistryStartTime = Date.now();
    console.log(`[${new Date().toISOString()}] Service registry initialization started`);
    await serviceRegistry(app);
    console.log(`[${new Date().toISOString()}] Service registry initialization completed in ${Date.now() - serviceRegistryStartTime}ms`);

    const configRegistryStartTime = Date.now();
    console.log(`[${new Date().toISOString()}] Config registry initialization started`);
    await configRegistry(app);
    console.log(`[${new Date().toISOString()}] Config registry initialization completed in ${Date.now() - configRegistryStartTime}ms`);

    // await TelegramBotNode(app);
    if (enableTelegramBot) {
        await telegramBot(app.context);
    } else {
        console.log("Telegram bot disabled by ENABLE_TELEGRAM_BOT=false");
    }



    const corsStartTime = Date.now();
    console.log(`[${new Date().toISOString()}] CORS initialization started`);
    await cors(app);
    console.log(`[${new Date().toISOString()}] CORS initialization completed in ${Date.now() - corsStartTime}ms`);

    if (process.env.LOCAL_UPLOAD_DIR) {
        app.use(localUpload);
        console.log(`Local uploads enabled at ${process.env.LOCAL_UPLOAD_DIR}`);
    }

    const redisStartTime = Date.now();
    console.log(`[${new Date().toISOString()}] Redis subscription started`);
    redisSubscribe(app);
    console.log(`[${new Date().toISOString()}] Redis subscription completed in ${Date.now() - redisStartTime}ms`);

    const routerStartTime = Date.now();
    console.log(`[${new Date().toISOString()}] Router initialization started`);
    app.use(router.routes());
    console.log(`[${new Date().toISOString()}] Router initialization completed in ${Date.now() - routerStartTime}ms`);    // Telegram bot süresini ölç (şu anda yorum satırı)

    // Server dinleme süresini ölç
    const listenStartTime = Date.now();
    console.log(`[${new Date().toISOString()}] Server listen started`);
    app.listen(port, async () => {
        const totalInitTime = Date.now() - serverStartTime;
        console.log(`[${new Date().toISOString()}] Server initialization completed in ${totalInitTime}ms`);
        console.log(`[${new Date().toISOString()}] Server listening on port ${port}`);
    });
    console.log(`[${new Date().toISOString()}] Server listen setup completed in ${Date.now() - listenStartTime}ms`);
    if (enableCrons) {
        await startCrons()
    } else {
        console.log("Cron jobs disabled by ENABLE_CRONS=false");
    }


}).catch((err) => {
    const totalFailTime = Date.now() - serverStartTime;
    console.error(`[${new Date().toISOString()}] Server initialization failed after ${totalFailTime}ms, error:`, err);
    process.exit(1);
})

app.on('error', (err: Error, ctx: Context) => {
    // Log the error
    console.error('Server error', err, ctx);
});



export default app;
