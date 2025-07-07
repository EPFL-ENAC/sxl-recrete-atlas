<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import 'maplibre-gl/dist/maplibre-gl.css'

import { DivControl } from '@/utils/control'
import {
  AttributionControl,
  GeoJSONSource,
  Map,
  MapMouseEvent,
  NavigationControl,
  Popup,
  type Callback,
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
    minZoom: window.innerWidth > 1900 ? 3 : props.minZoom,
    maxZoom: props.maxZoom,
    trackResize: true,
    attributionControl: false,
    renderWorldCopies: false, // 👈 disables repeating the world
    pixelRatio: window.devicePixelRatio || 1
  })
  map.addControl(new NavigationControl({}))
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
          main_concrete_type: project.main_concrete_type,
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

    // Base layer for single-project markers (existing)
    map.addLayer({
      id: 'buildings-layer',
      type: 'circle',
      source: 'buildings',
      paint: buildingPaint
    })

    // For clusters with two or more projects, we render a doughnut.
    // The inner circle represents pre‑cast and the outer ring (stroke) represents cast‑in‑place.
    // Change to doughnut style only if cluster count >= 2.
    // (You could further use feature properties if available to compute proportions.)
    const innerRatio = 0.7 // Inner circle is 60% of the total outer radius.
    const scaleFactor = 1.3 // Ripple scale factor.
    const period = 5000 // 4 seconds period.

    const innerRatio5 = 5 * innerRatio
    const innerRatio9 = 9 * innerRatio
    const innerRatio15 = 15 * innerRatio
    const innerRatio30 = 30 * innerRatio

    // Inner circle layer (pre‑cast, lighter red).
    map.addLayer({
      id: 'clusters-inner',
      type: 'circle',
      source: 'buildings',
      filter: ['has', 'point_count'],
      paint: {
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['get', 'point_count'],
          1,
          innerRatio5,
          2,
          innerRatio9,
          4,
          innerRatio15,
          10,
          innerRatio30
        ],
        'circle-color': '#ff3333', // Lighter red.
        'circle-opacity': 0.6
      }
    })

    // Start the animation loop for the doughnut (both layers).
    const startTime = performance.now()
    const animateClusters = () => {
      const elapsed = performance.now() - startTime
      // Progress (0 to 1) based on period.
      const progress = (elapsed % period) / period
      // Sine wave for smooth ripple (0 -> 1 -> 0).
      const rippleFactor = Math.sin(progress * Math.PI)

      // Animate outer radius with ripple.
      // Base outer radius: 1,5; 2,9; 4,15; 10,30 multiplied by (1 + (scaleFactor - 1) * rippleFactor)

      // // Inner radius is a fixed proportion.
      const innerRadiusExpr = [
        'interpolate',
        ['linear'],
        ['get', 'point_count'],
        1,
        innerRatio5 * (1 + (scaleFactor - 1) * rippleFactor),
        2,
        innerRatio9 * (1 + (scaleFactor - 1) * rippleFactor),
        4,
        innerRatio15 * (1 + (scaleFactor - 1) * rippleFactor),
        10,
        innerRatio30 * (1 + (scaleFactor - 1) * rippleFactor)
      ]

      map?.setPaintProperty('clusters-inner', 'circle-radius', innerRadiusExpr)
      requestAnimationFrame(animateClusters)
    }
    animateClusters()

    // Existing event bindings remain unchanged.
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
          // Increase the zoom level by 2 when a cluster is clicked.
          const currentZoom = map!.getZoom()
          map!.easeTo({
            center: e.lngLat,
            zoom: currentZoom + 2
          })
          return
        }
        // Handle non-clustered feature click.
        isProjectDialogOpen.value = true
        project.value = projects.value.find(
          (x: Project) =>
            x[`name_${locale.value as ProjectLang}`] ===
            feature.properties[`name_${locale.value as ProjectLang}`]
        )
      }
    )
    const popups: Popup[] = []
    map.on('mouseenter', 'buildings-layer', async function (e) {
      const property = e.features?.[0].properties
      if (property?.cluster && map) {
        const clusterId = property?.cluster_id
        const source = map.getSource('buildings') as GeoJSONSource
        source.getClusterLeaves(
          clusterId,
          Infinity,
          0,
          callbackOnLeaves as Callback<Array<GeoJSON.Feature>>
        )
        return // Exit early when handling a cluster
      } else {
        // Handle non-clustered feature
        callbackOnLeaves(null, e.features as MapGeoJSONFeature[])
      }

      function countConcreteTypes(
        features: Array<{ properties: { main_concrete_type?: string[] } }>
      ) {
        let pc = 0
        let cip = 0
        for (const feature of features) {
          const types = feature.properties.main_concrete_type
          if (Array.isArray(types)) {
            pc += types.filter((t) => t === 'PC').length
            cip += types.filter((t) => t === 'CIP').length
          }
        }
        return { PC: pc, CIP: cip }
      }
      function callbackOnLeaves(
        error: Error | null | undefined,
        features: MapGeoJSONFeature[]
      ): void {
        if (error) {
          console.error('Error getting cluster leaves:', error)
          return
        }
        console.log('Cluster leaves:', features)
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
                // Retrieve all leaves of cluster if it's a cluster
                // const clusterId = property?.cluster_id
                // const source = map.getSource('buildings') as GeoJSONSource
                if (property?.cluster && map) {
                  console.log('Cluster leaves:', features)
                  const { PC, CIP } = countConcreteTypes(features)
                  return `<h3>${property.point_count_abbreviated} ${t(
                    'receiver_title',
                    property.point_count_abbreviated
                  )}</h3>
                <!-- display PC and CIP counts 
                <p>${t('PC')}: ${PC}</p>
                <p>${t('CIP')}: ${CIP}</p>
                <i class="text-sm">${t('click_to_zoom')}</i>-->`
                } else {
                  // Handle non-clustered feature
                  const name = e.features?.[0].properties[`name_${locale.value as ProjectLang}`]
                  const property = e.features?.[0].properties
                  if (!name) {
                    console.error('Name is undefined')
                    return ''
                  }
                  return `<h3>${name}</h3>
                  <!--<p>${t('main_concrete_type')}: ${JSON.parse(property?.main_concrete_type || [])
                    .map((type: string) => t(type))
                    .join(', ')}</p>
                  <i class="text-sm">${t('click_to_detail')}</i>-->`
                }
              })()
            )
            .addTo(map)
          popups.push(a)
          map.getCanvas().style.cursor = 'pointer'
        }
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
