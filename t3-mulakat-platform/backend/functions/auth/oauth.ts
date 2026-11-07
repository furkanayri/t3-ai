import { generateOAuthCode, generateOauthState, checkRedirectUrl } from '@/utils';

export default async function authorizeClient(ctx: Context) {
    const { redirect_uri } = ctx.query

    checkRedirectUrl(redirect_uri?.toString(), ctx)

    const oauthState = await generateOauthState()

    const oauthCode = await generateOAuthCode(ctx.state.user?._id?.toString())

    ctx.body = {
        state: oauthState,
        code: oauthCode,
        contunie: redirect_uri
    }
}