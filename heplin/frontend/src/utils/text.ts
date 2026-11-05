export function copyToClipboard(str: string) {
    if (typeof str !== 'string') str = JSON.stringify(str, null, 2)
    navigator.clipboard.writeText(str)
}