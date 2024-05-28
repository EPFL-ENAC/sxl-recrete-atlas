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
  type StyleSpecification
} from 'maplibre-gl'
import { onMounted, ref, watch, defineModel, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'

import { useProjectsStore } from '@/stores/projects'
import type { Project, ProjectLang } from '@/types/Project'

const projects = storeToRefs(useProjectsStore()).projects


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
    minZoom: 4,
    maxZoom: undefined,
    popupLayerIds: () => [],
    areaLayerIds: () => [],
    scales: () => [],
    selectedScaleId: undefined,
  }
)

const { locale } = useI18n({ useScope: 'global' })

const loading = ref(true)
let map: Map | undefined = undefined
const isProjectDialogOpen = defineModel('isProjectDialogOpen', {
  type: Boolean,
  default: false,
})

const project = defineModel('project', {
  type: Object,
  default: undefined,
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
  map.addControl(new AttributionControl({
    compact: false,
    customAttribution: '© <a href="https://www.epfl.ch/labs/sxl/" target="_blank">SXL</a>'
  }));
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
    addProjects();
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

const computedData = computed<GeoJSON.GeoJSON | string>(() => {
  const features = projects.value.filter(x => x?.receiver_coordinates).map((project: Project) => ({
    "type": "Feature",
    "geometry": {
      "type": "Point",
      "coordinates": project?.receiver_coordinates ?? []
    },
    "properties": {
      [`name_${locale.value as ProjectLang}`]: project[`name_${locale.value as ProjectLang}`],
    }
  }));
  return {
    "type": "FeatureCollection",
    "features": features
  } as GeoJSON.GeoJSON;
})

watch(() => projects,
  () => {
    // all selected by default
    updateLayerData(computedData.value)
  },
  { immediate: true, deep: true }
)
watch(() => locale.value,
  () => {
    // all selected by default
    updateLayerData(computedData.value)
  }
)


function updateLayerData(newData: GeoJSON.GeoJSON | string): void {
  if (map !== undefined && newData !== undefined) {
    const source: GeoJSONSource = map.getSource('buildings') as GeoJSONSource;
    source?.setData(newData);
  }
}


function addProjects() {

  if (map !== undefined) {
    map.addSource('buildings', {
      type: 'geojson',
      data: computedData.value
    });
    // Now that we've added the source, we can create a layer that uses the 'buildings' source.
    map.addLayer({
      id: 'buildings-layer',
      type: 'circle',
      source: 'buildings',
      paint: {
        'circle-radius': 6,
        'circle-color': '#B42222'
      }
    });

    map.on('click', 'buildings-layer', function (e) {
      isProjectDialogOpen.value = true;
      project.value = projects.value.find(x => x[`name_${locale.value as ProjectLang}`] === e.features?.[0].properties[`name_${locale.value as ProjectLang}`]);
    });
    const popups: Popup[] = [];
    map.on('mouseenter', 'buildings-layer', function (e) {
      if (map !== undefined) {
        const a = new Popup({
          closeButton: false,
          closeOnClick: false,
          anchor: 'bottom'
        })
          .setLngLat((e.features?.[0].geometry as GeoJSON.Point)?.coordinates as LngLatLike)
          .setHTML('<h3>' + e.features?.[0].properties[`name_${locale.value as ProjectLang}`] + '</h3>')
          .addTo(map);
        popups.push(a);
        map.getCanvas().style.cursor = 'pointer';
      }
    });

    map.on('mouseleave', 'buildings-layer', function () {
      if (map !== undefined) {
        popups.forEach(p => p.remove());
        map.getCanvas().style.cursor = '';
      }
    });
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
