import { AUTH_APP_URL, GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET } from '@/constants';
import { generateOAuthCode, generateOauthState, validateOauthState } from '@/utils';
import axios from 'axios';
import { redirect_uri } from './google';

export default async function googleCallback(ctx: Context) {
    const { code, state } = ctx.query

    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
        code: code,
        state,
        client_id: GOOGLE_OAUTH_CLIENT_ID,
        client_secret: GOOGLE_OAUTH_CLIENT_SECRET,
        redirect_uri,
        grant_type: 'authorization_code'
    });

    const accessToken = tokenResponse.data.access_token;
    const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
    });

    const user = userInfoResponse.data;
    const statePayload = await validateOauthState(state?.toString())

    if (!statePayload) throw new Error("Invalid state")

    const result = await ctx.service('users').updateOne({
        googleId: user.id
    }, {
        name: user.given_name,
        surname: user.family_name,
        avatar: user.picture,
        email: user.email,
    }, {
        upsert: true,
        new: true
    })

    const oauthState = await generateOauthState(statePayload === "1" ? undefined : statePayload)

    const oauthCode = await generateOAuthCode(result._id?.toString())

    ctx.redirect(`${AUTH_APP_URL}/login?code=${oauthCode}&state=${oauthState}`)
}