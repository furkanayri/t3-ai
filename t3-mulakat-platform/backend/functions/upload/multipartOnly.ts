import { Context } from "koa";
import koaBody from "koa-body";




const actualKoaBodyMiddleware = koaBody({
    multipart: true,
    formidable: {

        keepExtensions: true,
        multiples: true,
    },
});


export default async function multipartOnly(ctx: Context) {
    await actualKoaBodyMiddleware(ctx, async () => {
    });

    return false;
}
