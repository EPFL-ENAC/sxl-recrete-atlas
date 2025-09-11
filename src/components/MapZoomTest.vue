<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

// Germany's bounding box: (5.98865807458, 47.3024876979, 15.0169958839, 54.983104153)
const GERMANY_BOUNDING_BOX = Object.freeze({
  west: 5.98865807458,
  south: 47.3024876979,
  east: 15.0169958839,
  north: 54.983104153
})

// Calculate Germany's width in degrees
const GERMANY_WIDTH_DEGREES = GERMANY_BOUNDING_BOX.east - GERMANY_BOUNDING_BOX.west

const containerWidth = ref(0)
const devicePixelRatio = ref(1)
const calculatedMaxZoom = ref(0)

const updateCalculations = () => {
  // Get container width in pixels
  const mapContainer = document.getElementById('test-container')
  containerWidth.value = mapContainer ? mapContainer.clientWidth : 800

  // Get device pixel ratio (default to 1 if not available)
  devicePixelRatio.value = window.devicePixelRatio || 1

  // Calculate the circumference of the Earth at the equator in meters
  const EARTH_CIRCUMFERENCE_METERS = 40075016.686

  // Convert Germany's width in degrees to meters at the equator
  // Note: This is approximate as the Earth is a sphere and distance varies with latitude
  const germanyWidthMeters = (GERMANY_WIDTH_DEGREES / 360) * EARTH_CIRCUMFERENCE_METERS

  // Calculate meters per pixel at zoom level 0 (entire world fits in 256 pixels)
  const TILE_SIZE = 256 // Standard tile size
  const metersPerPixelAtZoom0 = EARTH_CIRCUMFERENCE_METERS / TILE_SIZE

  // Calculate the ideal zoom level where germanyWidthMeters fits in containerWidth pixels
  // Formula: zoom = log2(containerWidth * devicePixelRatio * metersPerPixelAtZoom0 / germanyWidthMeters)
  const idealZoom = Math.log2(
    (containerWidth.value * devicePixelRatio.value * metersPerPixelAtZoom0) / germanyWidthMeters
  )

  // Return the calculated maxZoom, clamped between reasonable values
  calculatedMaxZoom.value = Math.max(5, Math.min(20, Math.floor(idealZoom)))
}

onMounted(() => {
  updateCalculations()
  window.addEventListener('resize', updateCalculations)
})

// Clean up event listener when component is unmounted
onUnmounted(() => {
  window.removeEventListener('resize', updateCalculations)
})
</script>

<template>
  <div class="pa-4">
    <h2>Dynamic Max Zoom Calculation Test</h2>
    <p>
      This component demonstrates how the dynamic maxZoom is calculated based on container size and
      device pixel ratio.
    </p>

    <v-card class="mb-4">
      <v-card-title>Calculation Details</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <v-list>
              <v-list-item>
                <v-list-item-title>Container Width</v-list-item-title>
                <v-list-item-subtitle>{{ containerWidth }} pixels</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Device Pixel Ratio</v-list-item-title>
                <v-list-item-subtitle>{{ devicePixelRatio }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Germany Width (degrees)</v-list-item-title>
                <v-list-item-subtitle>{{ GERMANY_WIDTH_DEGREES.toFixed(6) }}°</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-col>
          <v-col cols="12" md="6">
            <v-list>
              <v-list-item>
                <v-list-item-title>Calculated Max Zoom</v-list-item-title>
                <v-list-item-subtitle>{{ calculatedMaxZoom }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Germany Bounding Box</v-list-item-title>
                <v-list-item-subtitle>
                  ({{ GERMANY_BOUNDING_BOX.west.toFixed(6) }},
                  {{ GERMANY_BOUNDING_BOX.south.toFixed(6) }},
                  {{ GERMANY_BOUNDING_BOX.east.toFixed(6) }},
                  {{ GERMANY_BOUNDING_BOX.north.toFixed(6) }})
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card>
      <v-card-title>Test Container</v-card-title>
      <v-card-text>
        <div
          id="test-container"
          style="
            width: 100%;
            height: 200px;
            border: 2px dashed #ccc;
            display: flex;
            align-items: center;
            justify-content: center;
          "
        >
          <p class="text-center">
            This represents the map container<br />Resize the window to see calculations update
          </p>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<style scoped>
.text-center {
  text-align: center;
}
</style>
