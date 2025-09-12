import type { MapGeoJSONFeature, Map, GeoJSONSource, MapMouseEvent } from 'maplibre-gl'
import type { ProjectLang } from '@/types/Project'
import { from1920to512 } from './image'

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
  const isCluster = features.length > 1
  if (isCluster) {
    // Handle cluster features
    return `<h3>${features.length} ${t('receiver_title', features.length)}</h3>`
    // const pointCount = features[0]?.properties?.point_count

    // return `<h3>${features[0]?.properties?.point_count_abbreviated} ${t('receiver_title', pointCount)}</h3>`
  } else {
    // Handle individual project feature

    const prop = features[0]?.properties
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
    return result
  }
}

export function generateClusterExplodedLayer(
  features: MapGeoJSONFeature[],
  lngLat: maplibregl.LngLat
) {
  // Create arrays for point features and line features
  const pointFeatures = []
  const lineFeatures = []

  // Cluster center coordinates
  const centerCoords = [lngLat.lng, lngLat.lat]

  // Process each feature
  for (let index = 0; index < features.length; index++) {
    const feat = features[index]

    // Clone the feature
    const clonedFeature = JSON.parse(JSON.stringify(feat))

    // Calculate circular distribution
    const count = features.length
    const angle = (2 * Math.PI * index) / count // Evenly space points around circle

    // Base radius in pixels, scaled by number of points
    // Using a logarithmic scale to prevent excessive spreading for large clusters
    const baseRadius = 30
    const radius = baseRadius * Math.log(count + 1)

    // Simplified conversion from pixels to degrees
    // At zoom level 7, roughly 1 degree = 10000 pixels (this is an approximation)
    // We'll use a more conservative value to ensure visible separation
    const degreesPerPixel = 0.005

    // Calculate coordinate offsets
    const deltaLng = radius * degreesPerPixel * Math.cos(angle)
    const deltaLat = radius * degreesPerPixel * Math.sin(angle)

    // Calculate new coordinates
    const newLng = lngLat.lng + deltaLng
    const newLat = lngLat.lat + deltaLat

    // Handle coordinate wrapping for world copies
    let finalLng = newLng
    while (Math.abs(lngLat.lng - finalLng) > 180) {
      finalLng += lngLat.lng > finalLng ? 360 : -360
    }

    // Create point feature with new coordinates
    const pointFeature = {
      ...clonedFeature,
      geometry: {
        ...clonedFeature.geometry,
        coordinates: [finalLng, newLat]
      }
    }

    // Create line feature connecting point to cluster center
    const lineFeature = {
      type: 'Feature',
      properties: {
        ...clonedFeature.properties,
        isConnectionLine: true
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [finalLng, newLat], // Point position
          centerCoords // Cluster center
        ]
      }
    }

    pointFeatures.push(pointFeature)
    lineFeatures.push(lineFeature)
  }

  // Combine all features into a single collection
  const clusterFeatureCollection: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: [...pointFeatures, ...lineFeatures]
  }

  // Return the GeoJSON data
  return clusterFeatureCollection
}

/**
 * Closes an exploded cluster visualization
 * @param map - The Map instance
 */
export function closeClusterExplosion(map: Map): void {
  // Remove existing exploded layers if they exist
  if (map.getLayer('exploded-cluster-lines')) {
    map.removeLayer('exploded-cluster-lines')
  }
  if (map.getLayer('exploded-cluster-layer')) {
    map.removeLayer('exploded-cluster-layer')
  }
  if (map.getSource('exploded-cluster-source')) {
    map.removeSource('exploded-cluster-source')
  }

  // Restore the original cluster styling
  try {
    map.setPaintProperty('clusters-inner', 'circle-opacity', 0.6)
  } catch (e) {
    console.warn('Could not restore cluster opacity:', e)
  }
}

/**
 * Handles the explosion of a cluster when clicked at max zoom level
 * @param map - The Map instance
 * @param feature - The clicked cluster feature
 * @param event - The MapMouseEvent
 */
export function handleClusterExplosion(
  map: Map,
  feature: MapGeoJSONFeature,
  event: MapMouseEvent
): void {
  // Remove existing exploded layer if it exists
  closeClusterExplosion(map)

  // Dim the selected cluster by reducing its opacity
  // We'll store the original opacity to restore it later if needed
  try {
    map.setPaintProperty('clusters-inner', 'circle-opacity', 0.3)
  } catch (e) {
    console.warn('Could not adjust cluster opacity:', e)
  }

  // Get features in the cluster
  const source = map.getSource('buildings') as GeoJSONSource
  const clusterId = feature.properties.cluster_id

  source.getClusterLeaves(clusterId, Infinity, 0, (error, result) => {
    if (error) {
      console.error('Error getting cluster leaves:', error)
      return
    }

    // Check if result is valid
    if (!result) {
      console.error('No features returned from cluster')
      return
    }

    // Convert result to MapGeoJSONFeature[] for our function
    const features = result as unknown as MapGeoJSONFeature[]

    // Generate and add the exploded layer
    const explodedGeoJson = generateClusterExplodedLayer(features, event.lngLat)

    // Add source and layers to map
    map.addSource('exploded-cluster-source', {
      type: 'geojson',
      data: explodedGeoJson
    })

    // Add line layer for connections (rendered first so points appear on top)
    map.addLayer({
      id: 'exploded-cluster-lines',
      type: 'line',
      source: 'exploded-cluster-source',
      filter: ['==', 'isConnectionLine', true],
      paint: {
        'line-color': '#111',
        'line-width': 2,
        'line-dasharray': [1, 2]
      }
    })

    // Add circle layer for exploded points
    map.addLayer({
      id: 'exploded-cluster-layer',
      type: 'circle',
      source: 'exploded-cluster-source',
      filter: ['!=', 'isConnectionLine', true],
      paint: {
        'circle-radius': 8,
        'circle-color': '#ff3333',
        'circle-opacity': 0.7,
        'circle-stroke-color': '#fff',
        'circle-stroke-width': 2
      }
    })
  })
}
