import { validateData } from "@/utils";

export default async function validation(ctx: Context, options?: any) {
    const { body } = ctx.request;

    const { schema } = options;

    const { error } = await validateData(body, schema);

    if (error) {
        ctx.status = 400;
        const errors = error.details
        ctx.body = { errors }
        return errors
    }
};
