import { generateTokenAndSetCookie, validateOAuthCode, validateOauthState } from "@/utils";

export default async function exchangeOAuthCodeForToken(ctx: Context) {
    const { oauthCode, state } = ctx.request.body;

    if (!oauthCode) throw new Error("oauthCode is required")

    if (!state) throw new Error("state is required")

    try {
        const userId = await validateOAuthCode(oauthCode?.toString());
        const statePayload = await validateOauthState(state?.toString())

        if (!userId) {
            ctx.status = 400;
            ctx.body = { error: 'Invalid or expired OAuth code.' };
            return;
        }

        if (!statePayload) {
            ctx.status = 400;
            ctx.body = { error: 'Invalid or expired OAuth state.' };
            return;
        }
        const token = await generateTokenAndSetCookie(userId, ctx)

        const parsedStatePayload = JSON.parse(statePayload)

        ctx.status = 200;
        ctx.body = { token: token, contunie: parsedStatePayload?.contunie };
    } catch (error) {
        console.error('Error in token exchange:', error);
        ctx.status = 500;
        ctx.body = { error: 'An error occurred while exchanging the token.' };
    }
}