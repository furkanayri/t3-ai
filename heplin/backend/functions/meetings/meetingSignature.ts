import KJUR from 'jsrsasign';

export default async function meetingSignature(ctx: Context) {
    const iat = Math.round(new Date().getTime() / 1000);
    const exp = iat + (60 * 60);
    const oHeader = { alg: 'HS256', typ: 'JWT' };

    const oPayload = {
        sdkKey: process.env.CLIENT_ID,
        appKey: process.env.CLIENT_ID,
        mn: ctx.request.body.meetingNumber,
        role: ctx.request.body.role,
        iat: iat,
        exp: exp,
        tokenExp: iat + (60 * 60 * 2)
    };

    const sHeader = JSON.stringify(oHeader);
    const sPayload = JSON.stringify(oPayload);

    const signature = KJUR.jws.JWS.sign('HS256', sHeader, sPayload, process.env.SECRET_ID);

    ctx.body = { signature: signature };
}
