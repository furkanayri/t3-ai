import { OTP_HASH_SECRET, generateHash, generateOtp, generateTokenAndSetCookie, redisClient, sendOTPSms } from "@/utils";

const checkAndStoreOtp = async (phoneNumber: string) => {
    let otpCode: any;

    otpCode = generateOtp();

    const hashedOtpCode = generateHash(otpCode?.toString(), OTP_HASH_SECRET);

    const exists = await redisClient.get(`otp:${hashedOtpCode}`);
    if (exists) {
        await checkAndStoreOtp(phoneNumber); // Recursively generate if OTP already exists
    } else {
        await redisClient.set(`otp:${hashedOtpCode}`, phoneNumber, { EX: 300 }); // Expires in 300 seconds (5 minutes)
    }

    return otpCode
};

export default async function sendSmsOtp(ctx: Context) {
    try {
        // Logic to send SMS OTP
        const { phoneNumber } = ctx.request.body;

        if (!phoneNumber) {
            ctx.status = 400;
            ctx.body = 'Phone number is required.';
            return;
        }

        const isExistUser = await ctx.service("users").findOne({ phone: phoneNumber });

        if (!isExistUser) {
            ctx.status = 400;
            ctx.body = {
                message: 'User not found with this phone number.'
            }
            return;
        }

        //TODO: send sms if phone number is valid and not try in last 5 minutes

        const otpCode = await checkAndStoreOtp(phoneNumber?.toString());

        try {
            await sendOTPSms({ otp: otpCode, phone: phoneNumber?.toString() })
        } catch (error) {
            console.log(error)
        }

        ctx.status = 200;
        ctx.body = 'OTP sent successfully.';
    } catch (error) {
        console.log(error)
    }

}
