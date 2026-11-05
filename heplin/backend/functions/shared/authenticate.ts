import { generateHash, redisClient, verifyToken } from "@/utils";
import logout from "../auth/logout";

const JWT_HASH_SECRET = process.env.JWT_HASH_SECRET;

export default async function authenticate(ctx: Context) {
    const token = ctx.headers.authorization?.replace("Bearer ", "") || ctx.cookies.get("token");

    if (!token) {
        ctx.status = 401;
        ctx.body = {
            message: "You are not authorized to access this route.",
        };
        ctx.throw(401, "You are not authorized to access this route.")
    }

    try {
        const decoded = await verifyToken(token);

        if (!decoded) throw new Error("Invalid token");

        const hashToken = generateHash(token, JWT_HASH_SECRET);

        const isExistToken = await redisClient.exists(`token:${hashToken}&userId:${decoded.sub}`);

        if (!isExistToken) throw new Error("Token not found");

        const user = await ctx.service("users").findOne({ _id: decoded.sub });

        if (!user) {
            ctx.status = 401;
            ctx.body = {
                message: "User not found.",
            };
            return;
        }

        ctx.state.user = user;
        ctx.state.token = token;

    } catch (error) {
        if (error.message === 'TokenExpiredError') {
            if (ctx.state.user) {
                await logout(ctx);
            } else {
                ctx.status = 401;
                ctx.body = {
                    message: "Token expired, but user information is not available.",
                };
                return;
            }
        } else {
            ctx.status = 401;
            ctx.body = {
                message: "You are not authorized to access this route.",
            };
            return ctx.stop();
        }
    }
};
