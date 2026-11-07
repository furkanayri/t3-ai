import { redisClient } from "@/utils";

export default async function logout(ctx: Context) {
    if (ctx.state.user) {
        const usersTokens = await redisClient.keys(`token:*&userId:${ctx.state.user._id?.toString()}`);
        await redisClient.del(usersTokens);
    }
    ctx.status = 200;
    ctx.body = {
        isSuccess: true
    };
}
