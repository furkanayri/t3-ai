import { generateTokenAndSetCookie } from "@/utils";
import bcrypt from "bcryptjs";
import joi from "joi";

const validation = joi.object({
    name: joi.string().required(),
    surname: joi.string().required(),
    email: joi.string().email().required(),
    phone: joi.string().required(),
    password: joi.string().required(),
    isAcceptedKVKK: joi.boolean().required(),
    isAcceptedTOS: joi.boolean().required(),
})

export default async function register(ctx: Context) {
    const validatedData = validation.validate(ctx.request.body)

    if (validatedData.error) {
        ctx.status = 400
        ctx.body = {
            error: validatedData.error.message
        }
        return
    }

    const { name, surname, email, phone, password, isAcceptedKVKK, isAcceptedTOS } = validatedData.value

    const isExistingUser = await ctx.service("users").findOne({ $or: [{ email }, { phone }] })

    if (isExistingUser) {
        ctx.throw(400, "User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const userResponse = await ctx.service("users").create({
        name,
        surname,
        email,
        phone,
        status: 'active',
        password: hashedPassword,
        isAcceptedKVKK,
        isAcceptedTOS
    })

    const token = await generateTokenAndSetCookie(userResponse?._id?.toString(), ctx);

    ctx.status = 201
    ctx.body = {
        token,
        user: userResponse
    }

}