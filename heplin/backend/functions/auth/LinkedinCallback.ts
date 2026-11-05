import axios from 'axios';
import jwt from 'jsonwebtoken';
import qs from 'qs';
import { generateHash, generateTokenAndSetCookie, redisClient } from "@/utils";


export default async function LinkedinCallback(ctx) {
    const { authCode } = ctx.request.body;
    if (!authCode) {
        ctx.throw(400, 'Authorization code is required');
        return;
    }

    try {
        // Access Token ve ID Token al
        const { accessToken, idToken } = await fetchAccessToken(authCode);


        // ID Token'ı decode et ve içindeki bilgileri al
        const userInfo = decodeIdToken(idToken);


        // Kullanıcıyı veritabanına kaydet veya güncelle
        let user = await ctx.service("users").findOne({ email: userInfo.email });
        if (!user) {
            user = await ctx.service("users").create({
                name: userInfo.given_name,
                surname: userInfo.family_name,
                email: userInfo.email,
                profilePicture: userInfo.picture, // Profil resmi bilgisi
                locale: userInfo.locale,          // Kullanıcının dil/yerel ayar bilgisi
                isAcceptedTOS: true,
                isAcceptedKVKK: true,
                status: 'active',
            });
            console.log("Created new user:", user);
        } else {
            user = await ctx.service("users").updateOne(
                { _id: user._id },
                {
                    name: userInfo.given_name,
                    surname: userInfo.family_name,
                    email: userInfo.email,
                    profilePicture: userInfo.picture,
                    locale: userInfo.locale,
                }
            );
            console.log("Updated existing user:", user);
        }
        const token = await generateTokenAndSetCookie(user?._id?.toString(), ctx)
        ctx.body = {
            token,
            user,
        }
        console.log("ctx.body", ctx.body);
    } catch (error) {
        console.error("Error in registerWithLinkedin:", error.message);
        ctx.throw(500, 'Failed to register or login with LinkedIn');
    }
}

// Yetkilendirme kodunu kullanarak access token ve id token al
async function fetchAccessToken(authCode) {
    const payload = {
        grant_type: 'authorization_code',
        code: authCode,
        redirect_uri: process.env.REGISTER_REDIRECT_URI,
        client_id: process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET,
    };

    try {
        const response = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', qs.stringify(payload), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });
        console.log("Access Token Response:", response.data);

        // access_token ve id_token'ı döndür
        return {
            accessToken: response.data.access_token,
            idToken: response.data.id_token,
        };
    } catch (error) {
        console.error("Error fetching access token:", error.response ? error.response.data : error.message);
        throw new Error("Failed to fetch access token from LinkedIn.");
    }
}

// ID Token'ı decode et ve kullanıcı bilgilerini al
function decodeIdToken(idToken) {
    try {
        // ID Token'ı decode et
        const decoded = jwt.decode(idToken, { complete: true });

        // ID Token'dan kullanıcı bilgilerini çek
        const userInfo = {
            name: decoded.payload.name,
            given_name: decoded.payload.given_name,
            family_name: decoded.payload.family_name,
            picture: decoded.payload.picture,
            email: decoded.payload.email,
            email_verified: decoded.payload.email_verified,
            locale: decoded.payload.locale,
        };
        return userInfo;
    } catch (error) {
        console.error("Failed to decode ID Token:", error.message);
        throw new Error("Failed to decode ID Token.");
    }
}




