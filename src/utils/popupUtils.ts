import type { MapGeoJSONFeature, Map, GeoJSONSource, MapMouseEvent } from 'maplibre-gl'
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


export function generateClusterExplodedLayer(features: MapGeoJSONFeature[], lngLat: maplibregl.LngLat) {
  // Create a new GeoJSON feature collection for all features in the cluster
  const clusterFeatureCollection: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: features.map((feat) => {
      // Clone the feature
      const clonedFeature = JSON.parse(JSON.stringify(feat));
      
      // Handle coordinate wrapping for world copies
      const coordinates = (clonedFeature.geometry as GeoJSON.Point).coordinates.slice();
      while (Math.abs(lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += lngLat.lng > coordinates[0] ? 360 : -360;
      }
      
      return {
        ...clonedFeature,
        geometry: {
          ...clonedFeature.geometry,
          coordinates
        }
      };
    })
  };

  // Return the GeoJSON data
  return clusterFeatureCollection;
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
  if (map.getLayer('exploded-cluster-layer')) {
    map.removeLayer('exploded-cluster-layer');
  }
  if (map.getSource('exploded-cluster-source')) {
    map.removeSource('exploded-cluster-source');
  }

  // Get features in the cluster
  const source = map.getSource('buildings') as GeoJSONSource;
  const clusterId = feature.properties.cluster_id;

  source.getClusterLeaves(
    clusterId,
    Infinity,
    0,
    (error, result) => {
      if (error) {
        console.error('Error getting cluster leaves:', error);
        return;
      }

      // Check if result is valid
      if (!result) {
        console.error('No features returned from cluster');
        return;
      }

      // Convert result to MapGeoJSONFeature[] for our function
      const features = result as unknown as MapGeoJSONFeature[];

      // Generate and add the exploded layer
      const explodedGeoJson = generateClusterExplodedLayer(features, event.lngLat);

      // Add source and layer to map
      map.addSource('exploded-cluster-source', {
        type: 'geojson',
        data: explodedGeoJson
      });
      map.addLayer({
        id: 'exploded-cluster-layer',
        type: 'circle',
        source: 'exploded-cluster-source',
        paint: {
          'circle-radius': 8,
          'circle-color': '#ff3333',
          'circle-opacity': 0.7,
          'circle-stroke-color': '#fff',
          'circle-stroke-width': 2
        }
      });
    }
  );
}
