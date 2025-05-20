// src/utils/image.ts
// Utility to get the 512.webp version of an image path
export function toWebp512(imagePath: string): string {
  if (!imagePath) return ''
  if (imagePath.endsWith('-512.webp')) return imagePath
  return imagePath.replace(/\.(jpg|jpeg|png|webp)$/i, '-512.webp')
}
