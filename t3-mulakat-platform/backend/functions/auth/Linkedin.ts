import { LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET, SCOPE, AUTH_APP_URL, REGISTER_REDIRECT_URI } from '@/constants';
import { generateOauthState, checkRedirectUrl } from '@/utils';

// Redirect URI
export const linkedin_redirect_uri = `${process.env.URL}/auth/linkedin/callback`;

// LinkedIn OAuth Yönlendirme İşlemi
export default async function Linkedin(ctx: Context) {
    const contunie = ctx.query.contunie;  // Eğer frontend'den bir `contunie` parametresi geldiyse bunu kullanırız

    if (contunie) {
        checkRedirectUrl(contunie?.toString(), ctx); // Eğer `contunie` değeri varsa, URL doğrulaması yap.
    }

    const oauthState = await generateOauthState(contunie ? JSON.stringify({ contunie }) : undefined);

    // LinkedIn yetkilendirme URL'si oluşturulur
    const linkedinAuthUrl = encodeURI(`https://www.linkedin.com/oauth/v2/authorization?client_id=${LINKEDIN_CLIENT_ID}&response_type=code&scope=${SCOPE}&redirect_uri=${REGISTER_REDIRECT_URI}`);
    // Oluşturulan URL frontend'e döner.
    ctx.body = {
        redirectUrl: linkedinAuthUrl,
    };
}