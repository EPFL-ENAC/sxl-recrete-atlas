import { baseUrl } from './imageConfig'
import { toWebp1920, toWebp512, from1920to512 } from './image'

/**
 * Converts an image path to a full URL with the appropriate base URL for the current environment
 * @param imagePath - The relative path of the image (e.g., '/images/filename.jpg')
 * @returns The full URL of the image with the appropriate base URL
 */
export function getImageUrl(imagePath: string): string {
  // If the imagePath is already a full URL, return it as is
  if (imagePath.startsWith('http')) {
    return imagePath
  }
  
  // Normalize the path by removing any leading /images/ or images/ prefix
  let cleanPath = imagePath
  if (cleanPath.startsWith('/images/')) {
    cleanPath = cleanPath.substring('/images/'.length)
  } else if (cleanPath.startsWith('images/')) {
    cleanPath = cleanPath.substring('images/'.length)
  } else if (cleanPath.startsWith('/')) {
    cleanPath = cleanPath.substring(1)
  }
  
  // Combine base URL with clean path, ensuring proper formatting
  const base = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
  return `${base}/${cleanPath}`
}

/**
 * Gets a WebP 1920px version of an image with the appropriate base URL
 * @param imagePath - The relative path of the image
 * @returns The full URL of the WebP 1920px version of the image
 */
export function getWebp1920ImageUrl(imagePath: string): string {
  return getImageUrl(toWebp1920(imagePath))
}

/**
 * Gets a WebP 512px version of an image with the appropriate base URL
 * @param imagePath - The relative path of the image
 * @returns The full URL of the WebP 512px version of the image
 */
export function getWebp512ImageUrl(imagePath: string): string {
  return getImageUrl(toWebp512(imagePath))
}

/**
 * Converts a 1920px image path to a 512px version with the appropriate base URL
 * @param imagePath - The relative path of the 1920px image
 * @returns The full URL of the 512px version of the image
 */
export function get1920to512ImageUrl(imagePath: string): string {
  return getImageUrl(from1920to512(imagePath))
}
