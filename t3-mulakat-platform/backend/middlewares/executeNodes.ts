export default function executeNodes(...funcs: any[]) {
    return async function fn(ctx: Context, next: Next) {
        for (let i = 0; i < funcs.length; i++) {
            const func = funcs[i];

            if (typeof func !== "function") {
                continue;
            }
            const results = await func(ctx);
            if (results) {
                break;
            }
        }
        return next();
    }
}