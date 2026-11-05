export default async function whatsappWebhook(ctx: Context) {
    console.log('whatsappWebhook', ctx.query);

    const mode = ctx.query['hub.mode'];
    const challenge = ctx.query['hub.challenge'];
    const token = ctx.query['hub.verify_token'];
    console.log('mode', mode);
    console.log('challenge', challenge);
    console.log('token', token);

    console.log(mode === 'subscribe' && token === "heplin-whatsapp-webhook");

    if (mode && token) {
        console.log('mode && token', mode, token);

        if (mode === 'subscribe' && token === 'heplin-whatsapp-webhook') {
            ctx.status = 200;
            ctx.body = challenge;
        } else {
            ctx.status = 403;
        }
    } else {
        ctx.status = 400;
    }

}