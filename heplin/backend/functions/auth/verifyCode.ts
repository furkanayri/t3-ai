import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { generateTokenAndSetCookie } from '@/utils';

const SECRET = process.env.EPHEMERAL_SECRET || 'super-secret-key';

export default async function verifyCode(ctx: Context) {
    const { verificationToken, code, newPassword } = ctx.request.body;
    console.log("ctx.request.body", ctx.request.body);
    if (!verificationToken || !code || !newPassword) {
        throw new Error("All fields are required");
    }

    try {
        const decoded: any = jwt.verify(verificationToken, SECRET);

        if (decoded.code !== code) {
            throw new Error(`Code mismatch`);
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await ctx.service('users').updateOne(
            { email: decoded.email },
            { password: hashedPassword }
        );

        const user = await ctx.service('users').findOne({ email: decoded.email });
        const token = await generateTokenAndSetCookie(user._id?.toString(), ctx);
        ctx.body = {
            token,
            user,
            message: "Password set successfully",
        };
    } catch (err) {
        console.error("Error during verification:", err);
        throw new Error("Verification failed: " + err.message);
    }

}