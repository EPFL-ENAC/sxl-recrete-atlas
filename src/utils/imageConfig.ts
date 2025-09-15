export const baseUrlOptions = {
  prod: 'https://enacit4r-cdn.epfl.ch/sxl-atlas-recrete/2025-09-15/images',
  dev: '/images'
}

export const baseUrl = import.meta.env.DEV ? baseUrlOptions.dev : baseUrlOptions.prod
