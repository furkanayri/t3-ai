const QRCode = require('qrcode');

export async function qrGenerator(url: string) {
    try {
        const svg = await QRCode.toString(url, { type: 'svg' });
        return svg;
    } catch (err) {
        console.error('QR kod oluşturulurken bir hata oluştu:', err);
        throw err;
    }
}
