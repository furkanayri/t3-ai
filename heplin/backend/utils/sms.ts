import axios from "axios"
import https from "https"
import { createHmac } from 'crypto';

async function XMLPOST(postAddress: string, xmlData: string) {
    try {
        const agent = new https.Agent({
            rejectUnauthorized: false // equivalent to CURLOPT_SSL_VERIFYPEER=0
        });

        const response = await axios.post(postAddress, xmlData, {
            headers: {
                'Content-Type': 'text/xml'
            },
            httpsAgent: agent,
            timeout: 30000 // equivalent to CURLOPT_TIMEOUT, 30 seconds
        });

        return response.data;
    } catch (error) {
        console.error('Error making POST request:', error);
        return null;
    }
}

const xmlData = (username: string, password: string, senderTitle: string, phone: string, otpCode: string) => `<?xml version="1.0"?>
<mainbody>
   <header>
       <usercode>${username}</usercode>
       <password>${password}</password>
       <msgheader>${senderTitle}</msgheader>
   </header>
   <body>
       <msg>
           <![CDATA[Lutfen sifrenizi kimseyle paylasmayiniz. Tek kullanimlik güvenli islem sifreniz: ${otpCode}]]>
       </msg>
       <no>${phone}</no>
   </body>
</mainbody>`;

export function sendOTPSms({ otp, phone }: { otp: string, phone: string }) {
    const username = process.env.NETGSM_USERNAME
    const password = process.env.NETGSM_PASSWORD
    const senderTitle = process.env.NETGSM_SENDER_TITLE

    return XMLPOST('https://api.netgsm.com.tr/sms/send/otp', xmlData(username, password, senderTitle, phone, otp))
}


export const generateOtp = () => Math.floor(100000 + Math.random() * 900000);

export const OTP_HASH_SECRET = process.env.OTP_HASH_SECRET;

// Function to generate a hash for the OTP
export function generateHash(otp: string, secret: string): string {
    return createHmac('sha256', secret).update(otp).digest('hex');
}
