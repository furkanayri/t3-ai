import jwt from 'jsonwebtoken';
import { randomInt } from 'crypto';
import sendEmail from "@/utils/mail/sendMail";


const SECRET = process.env.EPHEMERAL_SECRET || 'super-secret-key';
const EXPIRES_IN_SECONDS = 3 * 60;

export default async function checkUserPassword(ctx: Context) {
    const { email } = ctx.request.body;
    if (!email) throw new Error("email is required");

    const user = await ctx.service('users').findOne({ email });
    if (!user) throw new Error("User not found");

    if (user.password) {
        ctx.body = { hasPassword: true };
        return;
    }

    const code = randomInt(100000, 999999).toString();
    const verificationToken = jwt.sign({ code, email }, SECRET, {
        expiresIn: EXPIRES_IN_SECONDS,
    });

    await sendEmail(
        "mail@heplin.com",
        email,
        "Verification Code",
        "verification-code",
        {
            name: user.name,
            code,
        }
    );

    ctx.body = {
        hasPassword: false,
        verificationToken,
    };
}