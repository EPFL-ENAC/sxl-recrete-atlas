<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import 'maplibre-gl/dist/maplibre-gl.css'

import { DivControl } from '@/utils/control'
import {
  AttributionControl,
  FullscreenControl,
  GeoJSONSource,
  Map,
  MapMouseEvent,
  NavigationControl,
  Popup,
  type LngLatLike,
  type MapGeoJSONFeature,
  type StyleSpecification
} from 'maplibre-gl'
import { onMounted, ref, watch, defineModel, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'

import { useProjectsStore } from '@/stores/projects'
import type { Project, ProjectLang } from '@/types/Project'

const projects = storeToRefs(useProjectsStore()).projects
const { t } = useI18n({ useScope: 'global' })

defineExpose({
  update
})
const props = withDefaults(
  defineProps<{
    styleSpec: string | StyleSpecification | undefined
    center?: LngLatLike
    zoom?: number
    aspectRatio?: number
    minZoom?: number
    maxZoom?: number
    popupLayerIds?: string[]
    areaLayerIds?: string[]
  }>(),
  {
    center: undefined,
    zoom: 4,
    aspectRatio: undefined,
    minZoom: 2,
    maxZoom: 10,
    popupLayerIds: () => [],
    areaLayerIds: () => [],
    scales: () => [],
    selectedScaleId: undefined
  }
)

const { locale } = useI18n({ useScope: 'global' })

const loading = ref(true)
let map: Map | undefined = undefined
const isProjectDialogOpen = defineModel('isProjectDialogOpen', {
  type: Boolean,
  default: false
})

const project = defineModel('project', {
  type: Object,
  default: undefined
})

onMounted(() => {
  map = new Map({
    container: 'maplibre-map',
    style: props.styleSpec || '',
    center: props.center,
    zoom: props.zoom,
    minZoom: props.minZoom,
    maxZoom: props.maxZoom,
    trackResize: true,
    attributionControl: false,
    pixelRatio: window.devicePixelRatio || 1
  })
  map.addControl(new NavigationControl({}))
  map.addControl(new FullscreenControl({}))
  map.addControl(
    new AttributionControl({
      compact: false,
      customAttribution: '© <a href="https://www.epfl.ch/labs/sxl/" target="_blank">SXL</a>'
    })
  )
  const positionControl = new DivControl({ id: 'map-position' })
  map.addControl(positionControl, 'bottom-left')

  map.on('mousemove', function (event: MapMouseEvent) {
    if (positionControl.container) {
      positionControl.container.innerHTML = `Lat/Lon: (${event.lngLat.lat.toFixed(4)}; ${event.lngLat.lng.toFixed(4)})`
    }
  })
  map.on('mouseout', function () {
    if (positionControl.container) {
      positionControl.container.innerHTML = ''
    }
  })

  map.once('load', () => {
    addProjects()
    loading.value = false
  })
})

watch(
  () => props.styleSpec,
  (styleSpec) => {
    if (styleSpec) {
      map?.setStyle(styleSpec)
    }
  },
  { immediate: true }
)

function update(center?: LngLatLike, zoom?: number) {
  if (map) {
    if (center !== undefined) {
      map.setCenter(center)
    }
    if (zoom !== undefined) {
      map.setZoom(zoom)
    }
  }
}

const effectiveCircleRadius = [
  'interpolate',
  ['exponential', 1.5],
  ['get', 'point_count'],
  1,
  5,
  2,
  9,
  4,
  15,
  10,
  30
]
const buildingPaint: any = {
  'circle-radius': effectiveCircleRadius,
  'circle-color': 'red',
  'circle-opacity': 0.5,
  'circle-stroke-color': 'red',
  'circle-stroke-width': 1,
  'circle-stroke-opacity': 0.5
}

// Function to convert offsets to latitude and longitude changes
function offsetToCoordinates(
  lon: number,
  lat: number,
  offsetX: number,
  offsetY: number
): [number, number] {
  const earthRadius = 6371 // Earth's radius in km

  const newLat = lat + (offsetY / earthRadius) * (180 / Math.PI)
  const newLon = lon + (offsetX / (earthRadius * Math.cos((Math.PI * lat) / 180))) * (180 / Math.PI)

  return [newLon, newLat]
}

const computedData = computed<GeoJSON.GeoJSON | string>(() => {
  const features = projects.value
    .filter((project) => project?.receiver_coordinates)
    .map((project: Project) => {
      // Read the offset computed in the store
      const { offset } = project
      const [offsetX, offsetY] = offset
      const currentCoordinates = project.receiver_coordinates!
      const newCoordinates = offsetToCoordinates(
        currentCoordinates[0],
        currentCoordinates[1],
        offsetX,
        offsetY
      )
      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: newCoordinates
        },
        properties: {
          [`name_${locale.value as ProjectLang}`]: project[`name_${locale.value as ProjectLang}`]
        }
      }
    })
  return {
    type: 'FeatureCollection',
    features: features
  } as GeoJSON.GeoJSON
})

watch(
  () => projects,
  () => {
    // all selected by default
    updateLayerData(computedData.value)
  },
  { immediate: true, deep: true }
)
watch(
  () => locale.value,
  () => {
    // all selected by default
    updateLayerData(computedData.value)
  }
)

function updateLayerData(newData: GeoJSON.GeoJSON | string): void {
  if (map !== undefined && newData !== undefined) {
    const source: GeoJSONSource = map.getSource('buildings') as GeoJSONSource
    source?.setData(newData)
  }
}

function addProjects() {
  if (map !== undefined) {
    map.addSource('buildings', {
      type: 'geojson',
      cluster: true,
      clusterMaxZoom: 9, // Max zoom to cluster points on
      clusterRadius: 20, // Radius of each cluster when clustering poi
      data: computedData.value
    })

    // Now that we've added the source, we can create a layer that uses the 'buildings' source.
    map.addLayer({
      id: 'buildings-layer',
      type: 'circle',
      source: 'buildings',
      paint: buildingPaint
    })

    // Additional effectScatter-like layer for clusters
    map.addLayer({
      id: 'clusters-effect',
      type: 'circle',
      source: 'buildings',
      filter: ['has', 'point_count'],
      paint: {
        // Base circle radius from eCharts config - your base values
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['get', 'point_count'],
          1,
          5,
          2,
          9,
          4,
          15,
          10,
          30
        ],
        'circle-color': '#ff0000',
        // Set a constant base opacity for fill effect (can be animated below)
        'circle-opacity': 0.6
      }
    })

    // eCharts ripple config defaults
    const period = 4000 // period in ms (4 seconds)
    const scaleFactor = 1.5

    // Start the animation loop for the clusters-effect layer.
    const startTime = performance.now()
    const animateClusters = () => {
      const elapsed = performance.now() - startTime
      // Calculate the progress of the ripple within one period (0 to 1)
      const progress = (elapsed % period) / period
      // Use a sine wave to have a smooth 0->1->0 ripple effect.
      const rippleFactor = Math.sin(progress * Math.PI)
      // For each feature, we adapt the base circle radius by multiplying with ripple.
      // Since our base is defined as:
      // 1, 5; 2, 9; 4, 15; 10, 30,
      // we multiply the base value by (1 + (scaleFactor - 1) * rippleFactor)
      map?.setPaintProperty('clusters-effect', 'circle-radius', [
        'interpolate',
        ['linear'],
        ['get', 'point_count'],
        1,
        5 * (1 + (scaleFactor - 1) * rippleFactor),
        2,
        9 * (1 + (scaleFactor - 1) * rippleFactor),
        4,
        15 * (1 + (scaleFactor - 1) * rippleFactor),
        10,
        30 * (1 + (scaleFactor - 1) * rippleFactor)
      ])
      // Fade the fill opacity according to the ripple. As the circle expands,
      // have it fade out (brushType is 'fill' per eCharts default).
      map?.setPaintProperty('clusters-effect', 'circle-opacity', 0.6 * (1 - rippleFactor))
      requestAnimationFrame(animateClusters)
    }
    animateClusters()

    // Existing event bindings remain unchanged
    map.on(
      'click',
      'buildings-layer',
      function (e: MapMouseEvent & { features?: MapGeoJSONFeature[] }) {
        const feature = e.features?.[0]
        if (!feature) {
          console.error('Feature is undefined')
          return
        }
        if (feature.properties?.cluster) {
          // Increase the zoom level by 2 when a cluster is clicked
          const currentZoom = map!.getZoom()
          map!.easeTo({
            center: e.lngLat,
            zoom: currentZoom + 2
          })
          return
        }
        // Handle non-clustered feature click
        isProjectDialogOpen.value = true
        project.value = projects.value.find(
          (x: Project) =>
            x[`name_${locale.value as ProjectLang}`] ===
            feature.properties[`name_${locale.value as ProjectLang}`]
        )
      }
    )
    const popups: Popup[] = []
    map.on('mouseenter', 'buildings-layer', function (e) {
      if (map !== undefined) {
        const a = new Popup({
          closeButton: false,
          closeOnClick: false,
          anchor: 'bottom'
        })
          .setLngLat((e.features?.[0].geometry as GeoJSON.Point)?.coordinates as LngLatLike)
          .setHTML(
            (() => {
              const property = e.features?.[0].properties
              if (property?.cluster) {
                return `<h3>${property.point_count_abbreviated} ${t('receiver_title', property.point_count_abbreviated)}</h3>`
              } else {
                const name = e.features?.[0].properties[`name_${locale.value as ProjectLang}`]
                return `<h3>${name}</h3>`
              }
            })()
          )
          .addTo(map)
        popups.push(a)
        map.getCanvas().style.cursor = 'pointer'
      }
    })

    map.on('mouseleave', 'buildings-layer', function () {
      if (map !== undefined) {
        popups.forEach((p) => p.remove())
        map.getCanvas().style.cursor = ''
      }
    })
  }
}
</script>

<template>
  <v-progress-linear v-if="loading" active color="primary" indeterminate />
  <v-responsive :aspect-ratio="aspectRatio" height="100%">
    <div id="maplibre-map" />
  </v-responsive>
</template>

<style scoped>
#maplibre-map {
  height: 100%;
}
</style>
