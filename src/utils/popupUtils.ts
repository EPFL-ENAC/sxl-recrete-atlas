import type { MapGeoJSONFeature } from 'maplibre-gl'
import type { ProjectLang } from '@/types/Project'
import { from1920to512 } from './image';

/**
 * Generates HTML content for map popups based on features
 * @param features - Array of map features (either clustered or individual projects)
 * @param locale - Current locale ('en' or 'fr')
 * @param t - Translation function
 * @returns HTML string for the popup content
 */
export function generatePopupHTML(
  features: MapGeoJSONFeature[],
  locale: ProjectLang,
  t: (key: string, count?: number) => string
): string {
  // Check if we're dealing with a cluster (first feature has cluster property)
  const isCluster = features.length > 1;
  if (isCluster) {
    // Handle cluster features
    return `<h3>${features.length} ${t('receiver_title', features.length)}</h3>`
    // const pointCount = features[0]?.properties?.point_count

    // return `<h3>${features[0]?.properties?.point_count_abbreviated} ${t('receiver_title', pointCount)}</h3>`
  } else {
    // Handle individual project feature

    const prop = features[0]?.properties;
    if (!prop) {
      console.error('Properties are undefined for feature:', features[0])
      return ''
    }

    if (!prop[`name_${locale}`]) {
      console.error('Name is undefined for feature:', features[0])
      return ''
    }
    let result = `<h3>${prop[`name_${locale}`]}</h3>`
    if (prop.image === undefined) {
      console.error('Image is undefined for feature:', features[0])
      return result
    }
    if (prop.image !== '') {
        result += `<img src="${from1920to512(prop.image)}" alt="${prop.image_credit}" style="width:100%;height:auto;"/>`
    }
    return result;
  }
}
