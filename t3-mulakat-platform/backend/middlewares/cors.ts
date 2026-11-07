import corsMid from "@koa/cors";

export async function cors(app: App) {
    app.use(
        corsMid({
            credentials: true,
            origin: (ctx) => {
                const validDomains = app.context.configs.corsOrigins;
                if (validDomains.indexOf(ctx.request.header.origin) !== -1) {
                    return ctx.request.header.origin;
                }
                return validDomains[0]; // we can't return void, so let's return one of the valid domains
            },
        })
    );

    return app;
}