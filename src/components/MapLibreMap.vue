<script setup lang="ts">
import 'maplibre-gl/dist/maplibre-gl.css'
import 'maplibregl-theme-switcher/styles.css'
import 'maplibregl-scale-legend/styles.css'

import { DivControl } from '@/utils/control'
import { ThemeSwitcherControl } from 'maplibregl-theme-switcher'
import type { ThemeDefinition } from 'maplibregl-theme-switcher'
import { ScaleLegendControl } from 'maplibregl-scale-legend'
import type { ScaleDefinition } from 'maplibregl-scale-legend'
import {
  AttributionControl,
  FullscreenControl,
  GeoJSONSource,
  GeolocateControl,
  Map,
  MapMouseEvent,
  // Marker,
  NavigationControl,
  Popup,
  ScaleControl,
  type LngLatLike,
  type StyleSpecification
} from 'maplibre-gl'
import { onMounted, ref, watch, defineModel, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { SelectableSingleItem } from '@/utils/layerSelector'
import type { LegendScale, ScaleEntry } from '@/utils/jsonWebMap'
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
    themes: SelectableSingleItem[]
    scales: LegendScale[]
    selectedScaleId?: string
    selectableLayerIds?: string[]
    selectedLayerIds?: string[]
    popupLayerIds?: string[]
    areaLayerIds?: string[]
  }>(),
  {
    center: undefined,
    zoom: 4,
    aspectRatio: undefined,
    minZoom: 4,
    maxZoom: undefined,
    selectableLayerIds: () => [],
    selectedLayerIds: () => [],
    popupLayerIds: () => [],
    areaLayerIds: () => [],
    scales: () => [],
    selectedScaleId: undefined,
  }
)
const emit = defineEmits<{
  (e: 'documentation', value: string): void
  (e: 'specie', value: string): void
}>()

const { t, locale } = useI18n({ useScope: 'global' })

const loading = ref(true)
let map: Map | undefined = undefined
const scaleControl = ref<ScaleLegendControl>()
const isProjectDialogOpen = defineModel('isProjectDialogOpen',{
  type: Boolean,
  default: false,
})

const project = defineModel('project',{
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
  map.addControl(new GeolocateControl({}))
  map.addControl(new ScaleControl({}))
  map.addControl(new FullscreenControl({}))
  map.addControl(new AttributionControl({
    compact: false,
    customAttribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>, <a href="https://www.epfl.ch/labs/sxl/" target="_blank">SXL</a>'
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
    filterLayers()
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

watch(
  () => props.themes,
  (themes) => {
    if (themes) {
      const themeDefs: ThemeDefinition[] = themes.map((item: SelectableSingleItem) => {
        return {
          id: item.id,
          label: t(item.label),
          selected: item.selected
        }
      })
      const selectedTheme = themes.find((item) => item.selected)?.id
      map?.addControl(new ThemeSwitcherControl(themeDefs, selectedTheme))
    }
  },
  { immediate: true }
)


watch(
  () => props.scales,
  (scales) => {
    if (scales) {
      const scaleDefs: ScaleDefinition[] = scales.map((item: LegendScale) => {
        return {
          id: item.id,
          title: t(item.id),
          titleStart: item.titleStart ? t(item.titleStart) : undefined,
          titleEnd: item.titleEnd ? t(item.titleEnd) : undefined,
          scale: item.scale.map((entry: ScaleEntry) => {
            const range: string[] | undefined = entry.range ? [
              formatNumber(entry.range[0], "") ?? "",
              formatNumber(entry.range[1], "") ?? ""
            ] : undefined
            return {
              label: entry.label ? t(entry.label) : undefined,
              color: entry.color,
              range: range,
              unit: entry.unit ? t(entry.unit) : (item.unit ? t(item.unit) : undefined)
            }
          })
        }
      })
      scaleControl.value = new ScaleLegendControl(scaleDefs)
      map?.addControl(scaleControl.value, 'top-left')
      if (props.selectedScaleId) {
        scaleControl.value.showScale(props.selectedScaleId)
      }
    }
  },
  { immediate: true }
)

watch(() => props.selectedScaleId, () => {
  if (scaleControl.value) {
    scaleControl.value.showScale(props.selectedScaleId)
  }
}, {
  immediate: true
})

watch([() => props.selectableLayerIds, () => props.selectedLayerIds], () => filterLayers(), {
  immediate: true
})

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

function filterLayers() {
  if (map?.loaded()) {
    map
      .getStyle()
      .layers
      .filter((layer) => !props.themes.map((theme) => theme.id).includes(layer.id))
      .forEach((layer) => {
        map?.setLayoutProperty(
          layer.id,
          'visibility',
          props.selectedLayerIds.includes(layer.id) ? 'visible' : 'none'
        )
      })
  }
}

const computedData = computed(() => {
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
      };
})

watch(() => projects,
  () => {
    // all selected by default
    updateLayerData(computedData.value)
  },
  { immediate: true, deep:true }
)
watch(() => locale.value,
  () => {
    // all selected by default
    updateLayerData(computedData.value)
  }
)


function updateLayerData(newData:any): void {
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
    const popups: any[] = [];
    map.on('mouseenter', 'buildings-layer', function (e) {
      if (map !== undefined) {
        const a = new Popup({
          closeButton: false,
          closeOnClick: false,
          anchor: 'bottom'
        })
        .setLngLat((e.features?.[0].geometry as any)?.coordinates as LngLatLike)
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

function formatNumber(nb: number, unit: string) {
  return nb === undefined || isNaN(nb) ? '-' : `${new Intl.NumberFormat(`${locale.value}`).format(Math.round(nb * 100) / 100)} ${unit}`
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
