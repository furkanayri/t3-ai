import { createHmac } from 'crypto';

export function generateHash(otp: string, secret: string): string {
    return createHmac('sha256', secret).update(otp).digest('hex');
}