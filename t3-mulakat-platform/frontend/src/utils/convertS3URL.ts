export function convertPublicFileURL(fileKey?: string): string {
  if (!fileKey) return ""
  return `${import.meta.env.VITE_PUBLIC_ASSET_URL}/${fileKey}`
}