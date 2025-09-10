/**
 * Utility to get the 512.webp version of an image path.
 * @param imagePath The path of the image. Can be null or undefined.
 * @returns The path of the image with -512.webp appended to it, or an empty string if imagePath is falsy.
 * @example toWebp512('image.png') => 'image-512.webp'
 * @example toWebp512(null) => ''
 */
export declare function toWebp512(imagePath: string | null | undefined): string
export declare function toWebp1920(imagePath: string | null | undefined): string
