import { randomBytes } from 'crypto';
import jwt from 'jsonwebtoken';
import { generateHash, redisClient } from '.';

const OAUTH_STATE_HASH_SECRET = process.env.OAUTH_STATE_HASH_SECRET;
const OAUTH_CODE_HASH_SECRET = process.env.OAUTH_CODE_HASH_SECRET;

export async function generateOauthState(payload?: any) {
    const state = randomBytes(16).toString('hex');
    const hashedState = generateHash(state, OAUTH_STATE_HASH_SECRET)

    const redisKey = `oauthstate:${hashedState}`

    const exists = await redisClient.exists(redisKey)

    if (exists) return generateOauthState(payload) // Recursively call the function again if the state already exists

    await redisClient.set(redisKey, payload || 1, {
        EX: 60 // Expires in 60 seconds (1 minutes)
    })
    return state
}

export async function validateOauthState(state: string) {
    const hashedState = generateHash(state, OAUTH_STATE_HASH_SECRET)
    const redisKey = `oauthstate:${hashedState}`

    const payload = await redisClient.get(redisKey)

    if (!payload) return false

    await redisClient.del(redisKey)

    return payload
}

export async function generateOAuthCode(userId: string) {
    const state = randomBytes(16).toString('hex');
    const hashedState = generateHash(state, OAUTH_CODE_HASH_SECRET);

    const redisKey = `oauthcode:${hashedState}`

    const exists = await redisClient.exists(redisKey)

    if (exists) return generateOAuthCode(userId) // Recursively call the function again if the state already exists

    await redisClient.set(redisKey, userId?.toString(), {
        EX: 60 // Expires in 60 seconds (1 minutes)
    })

    return state
}

export async function validateOAuthCode(oauthCode: string) {
    const hashedOauthCode = generateHash(oauthCode?.toString(), OAUTH_CODE_HASH_SECRET);

    const userId = await redisClient.get(`oauthcode:${hashedOauthCode}`);

    if (!userId) return false

    await redisClient.del(`oauthcode:${hashedOauthCode}`);

    return userId
}

async function generateJWT(userId: string): Promise<string> {
    return new Promise((resolve, reject) => {
        jwt.sign({
            issuer: 'your_app_name',
            sub: userId,
        }, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
            if (err) reject(err)
            resolve(token)
        });
    })
}

export async function verifyToken(token: string): Promise<any> {
    return new Promise((resolve, reject) => {
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    reject(new Error('TokenExpiredError'));
                }
                reject(err);
            }
            resolve(decoded);
        });
    });
}


export async function generateTokenAndSetCookie(userId: string, ctx: Context) {
    const token = await generateJWT(userId)
    const hashedToken = generateHash(token, process.env.JWT_HASH_SECRET)

    await redisClient.set(`token:${hashedToken}&userId:${userId}`, userId, { EX: 604800 }); // Expires in 86400 seconds (1 day)

    // ctx.cookies.set('token', token, {
    //     httpOnly: false,
    //     secure: process.env.NODE_ENV === 'production' && ctx.secure ? true : false,
    //     maxAge: 1000 * 60 * 60 * 24 * 1, // 1 day,
    //     // domain: process.env.NODE_ENV === 'production' ? '.pages.dev' : undefined
    // })

    return token
}

export async function checkRedirectUrl(redirectUrl: string, ctx: Context) {
    const isValid = ctx.configs.validRedirectUrls.includes(redirectUrl)

    if (!isValid) throw new Error("redirect_uri is not allowed")
    return true
}