// src/utils/image.js
// Utility to get the 512.webp version of an image path
// imagePath: string - The path of the image
// Returns the path of the image with -512.webp appended to it
// Example: toWebp512('image.png') => 'image-512.webp'
export function toWebp512(imagePath) {
  if (!imagePath) return ''
  imagePath = imagePath.trim()
  if (imagePath.endsWith('-512.webp')) return imagePath
  return imagePath.replace(/\.(jpg|jpeg|png|webp)$/i, '-512.webp')
}


export function toWebp1920(imagePath) {
  if (!imagePath) return ''
  imagePath = imagePath.trim()
  if (imagePath.endsWith('-1920.webp')) return imagePath
  return imagePath.replace(/\.(jpg|jpeg|png|webp)$/i, '-1920.webp')
}
