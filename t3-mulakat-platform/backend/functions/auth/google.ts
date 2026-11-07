import { AUTH_APP_URL, GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET } from '@/constants';
import { generateOAuthCode, generateOauthState, checkRedirectUrl, validateOauthState } from '@/utils';
import axios from 'axios';

export const redirect_uri = `${process.env.URL}/auth/google/callback`

export default async function google(ctx: Context) {
    const contunie = ctx.query.contunie

    if (contunie) {
        checkRedirectUrl(contunie?.toString(), ctx)
    }
    const oauthState = await generateOauthState(contunie ? JSON.stringify({
        contunie
    }) : undefined)

    ctx.redirect(`https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_OAUTH_CLIENT_ID}&redirect_uri=${redirect_uri}&response_type=code&scope=openid%20email%20profile&state=${oauthState}`)
}
