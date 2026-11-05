export default function object(obj: any): object {
    return typeof obj === 'object' && !Array.isArray(obj) && !!obj && !(obj instanceof Date) ? obj : {};
}

export function isObject(obj: any) {
    return typeof obj === 'object' && !!obj && !Array.isArray(obj)
}