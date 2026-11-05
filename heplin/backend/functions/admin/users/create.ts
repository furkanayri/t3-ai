import bcrypt from "bcryptjs";
import joi from "joi";

const validation = joi.object({
    name: joi.string().required(),
    surname: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().required(),
    isAcceptedKVKK: joi.boolean().required(),
    isAcceptedTOS: joi.boolean().required(),
    phone: joi.string().optional(),
    maritalStatus: joi.string().optional(),
    militaryStatus: joi.string().optional(),
    gender: joi.string().optional(),
    address: joi.string().optional(),
    identificationNumber: joi.string().optional(),
});

export default async function create(ctx: Context) {
    const validatedData = validation.validate(ctx.request.body);
    console.log(ctx.request.body)
    if (validatedData.error) {
        ctx.status = 400;

        ctx.body = {
            error: validatedData.error.message,
        };
        return;
    }

    const payload = ctx.request.body;
    const isExistingUser = await ctx
        .service("users")
        .findOne({ email: payload.email });

    if (isExistingUser) {
        ctx.status = 400;
        ctx.body = {
            error: "User already exists",
        };
        return;
    }

    const hashedPassword = await bcrypt.hash(payload.password, 12);

    const userResponse = await ctx.service("users").create({
        ...payload,
        password: hashedPassword,
        status: "active"
    });

    ctx.status = 201;
    ctx.body = {
        user: userResponse,
    };
}
