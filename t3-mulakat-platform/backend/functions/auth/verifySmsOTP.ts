import { OTP_HASH_SECRET, generateHash, generateTokenAndSetCookie, redisClient } from "@/utils";

export default async function verifySmsOtp(ctx: Context) {
    const { otpCode, phoneNumber } = ctx.request.body;
    const hashedOtpCode = generateHash(otpCode?.toString(), OTP_HASH_SECRET);

    try {
        const user = await ctx.service("users").findOne({ phone: phoneNumber }, {
            select: "-password"
        })
        if (!user) {
            ctx.status = 400;
            ctx.body = {
                message: 'User not found with this phone number.'
            }
            return;
        }
        const storedPhoneNumber = await redisClient.get(`otp:${hashedOtpCode}`);

        if (!storedPhoneNumber) {
            ctx.status = 400;
            ctx.body = {
                message: 'Invalid or expired OTP code.'
            }
            return;
        }

        if (storedPhoneNumber?.toString() !== phoneNumber?.toString()) {
            ctx.status = 400;
            ctx.body = {
                message: 'Phone number does not match OTP code.'
            }
            return;
        }

        const token = await generateTokenAndSetCookie(user._id?.toString(), ctx);

        // OTP is valid. Proceed with user authentication or registration logic

        ctx.status = 200;
        ctx.body = {
            token,
            message: 'OTP verified successfully. User authenticated.',
            user
        }

        // Optionally, delete the OTP from Redis after successful verification
        await redisClient.del(`otp:${hashedOtpCode}`);

    } catch (error) {
        console.error('Error verifying OTP: ', error);
        ctx.status = 500;
        ctx.body = 'An error occurred while verifying the OTP.';
    }
}