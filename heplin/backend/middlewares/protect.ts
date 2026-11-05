export async function protect(ctx: Context, next: Next) {
    const token = ctx.headers.authorization?.replace("Bearer ", "") || ctx.cookies.get("token");

    if (!token) {
        ctx.status = 401;
        ctx.body = {
            message: "You are not authorized to access this route.",
        };
        return;
    }
    //TODO: connect to applin
}