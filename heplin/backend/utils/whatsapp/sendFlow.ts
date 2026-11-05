import axios from "axios";
import { s3Client } from "@/utils";
import slugify from "slugify";
import { uuid } from "uuidv4";
import pdftoJson from "../pdftoJson";
import { redisClient } from "@/utils";

export async function sendFlow(from, phone) {
    try {

        const response = await axios.post(
            `https://graph.facebook.com/v21.0/${phone}/messages`,

            {
                "messaging_product": "whatsapp",
                "recipient_type": "individual",
                "to": `${from}`,
                "type": "template",
                "template": {
                    "name": "apply_with_id",
                    "language": {
                        "code": "en_US"
                    },
                    "components": [
                        {
                            "type": "body",
                            "parameters": [
                                {
                                    "type": "text",
                                    "text": `test`
                                }
                            ]
                        },
                        {
                            "type": "button",
                            "sub_type": "flow",
                            "index": "0",
                            "parameters": [
                                {
                                    "type": "action",
                                    "action": {
                                        "flow_token": "unused",
                                        "flow_action_data": {
                                            "start_screen": "screen_ozujtr"
                                        }
                                    }
                                }
                            ]
                        }
                    ]
                }
            },

            {
                headers: {
                    Authorization: `Bearer ${process.env.WHATSAPP_API_ACCESS_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log(response.data);
    } catch (error) {
        console.error(error);
    }
}
export async function sendJobNotFound(from, phone) {
    let data = JSON.stringify({
        "messaging_product": "whatsapp",
        "to": `${from}`,
        "type": "template",
        "template": {
            "name": "jobnotfound_offical",
            "language": {
                "code": "en_US"
            }
        }
    });

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `https://graph.facebook.com/v21.0/${phone}/messages`,
        headers: {
            Authorization: `Bearer ${process.env.WHATSAPP_API_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
        },
        data: data
    };
    await axios.request(config)
        .then((response) => {
        })
        .catch((error) => {
        });
}
const generateFileKey = (fileName) => {
    return uuid() + "-" + slugify(fileName, {
        lower: true,
        trim: true,
        remove: /[*+~()'"!:@]/g,
    });
};

export async function whatsappTakeImage(imageId) {
    let config = {
        method: 'get',
        url: `https://graph.facebook.com/v21.0/${imageId}`,
        headers: {
            Authorization: `Bearer ${process.env.WHATSAPP_API_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
        }
    };
    console.log('wowowowoowoowowowo');

    try {
        const response = await axios.request(config);
        console.log('1', response);
        console.log('wowowowoowoowowowo11111111111111111111111111111111111111111111');

        const { url, mime_type } = response.data;

        const mediaResponse = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${process.env.WHATSAPP_API_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            },
            responseType: 'arraybuffer'
        });

        const fileName = generateFileKey("facebook-media-file.pdf");
        const s3Upload = await s3Client.upload({
            Bucket: process.env.AWS_BUCKET_PRIVATE,
            Key: fileName,
            Body: Buffer.from(mediaResponse.data),
            ContentType: mime_type
        }).promise();


        const pdfData = await pdftoJson(Buffer.from(mediaResponse.data));


        return {
            isSuccess: true,
            key: s3Upload.Key,
            pdfData
        };

    } catch (error) {
        console.error("Dosya indirme veya yükleme sırasında hata oluştu:", error);
        return {
            isSuccess: false,
            message: "Dosya indirme veya yükleme sırasında bir hata oluştu."
        };
    }
}
export async function whatsappMessage(from, phone, message) {
    let data = JSON.stringify({
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": from,
        "type": "text",
        "text": {
            "body": `${message}`
        }
    });

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `https://graph.facebook.com/v21.0/${phone}/messages`,
        headers: {
            Authorization: `Bearer ${process.env.WHATSAPP_API_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
        },
        data: data
    };

    await axios.request(config)
}


export async function saveUserState(userPhone: number, state: object) {
    const key = `userWpState:${userPhone}`;
    await redisClient.set(key, JSON.stringify(state), { EX: 3600 }); // 1 saat zaman aşımı
};

export async function getUserState(userPhone: number) {
    const key = `userWpState:${userPhone}`;
    const state = await redisClient.get(key);
    return state ? JSON.parse(state) : {};
};

export async function deleteUserState(userPhone) {
    const key = `userWpState:${userPhone}`;

    await redisClient.del(key);
    console.log(`Redis'teki Job ID silindi.`);
};
