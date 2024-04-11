<script setup lang="ts">
import LayerSelector from '@/components/LayerSelector.vue'
import MapLibreMap from '@/components/MapLibreMap.vue'
import type { Parameters, LegendScale } from '@/utils/jsonWebMap'
import { mdiChevronLeft, mdiChevronRight, mdiClose, mdiLayers, mdiMapLegend, mdiRuler, mdiCircle, mdiCircleOutline, mdiOpenInNew, mdiInformation } from '@mdi/js'
import type { SelectableGroupItem, SelectableItem, SelectableSingleItem, SpeciesItem } from '@/utils/layerSelector'
import axios from 'axios'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { useDisplay } from 'vuetify'
import { computed, onMounted, ref, shallowRef, triggerRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { StyleSpecification } from 'maplibre-gl'
// @ts-ignore
import Papa from 'papaparse'
import { useCookies } from 'vue3-cookies'

const props = defineProps<{
  styleUrl: string
  parametersUrl: string
  cdnUrl: string
  martinUrl: string
}>()

const CDN_DATA_URL = `${props.cdnUrl}/data`
const MARTIN_URL = props.martinUrl

const { t, locale } = useI18n({ useScope: 'global' })
const { cookies } = useCookies()

const map = ref<InstanceType<typeof MapLibreMap>>()
const selector = ref<InstanceType<typeof LayerSelector>>()
const selectedLayerIds = ref<string[]>([])
const style = shallowRef<StyleSpecification>()
const parameters = shallowRef<Parameters>()
const legendDialog = ref(false)
const legendDialogTitle = ref<string>()
const legendDialogImageSrc = ref<string>()
const drawerRail = ref(false)
const drawerRight = ref(false)
const drawerHtml = ref('')
const docId = ref<string>()
const docHtml = ref<any>({})
const { mobile } = useDisplay()
const scale = ref<string>()
const showAllSpecies = ref<boolean>(true)

const allMeasures: string[] = [
  'voc', 'pm10', 'ofp', 'o3'
]
const documentationIds: string[] = [
  "genus", "specie", "graph", "leaf_type", "crown_area", "leaf_area", ...allMeasures
]

const genusPaint = {
  'circle-radius': [
    'interpolate',
    ['linear'],
    ['zoom'],
    14, 1,
    15, ['*', 0.125, ['number', ['get', 'D_COUR_M'], 5]],
    16, ['*', 0.25, ['number', ['get', 'D_COUR_M'], 5]],
    17, ['*', 0.5, ['number', ['get', 'D_COUR_M'], 5]],
    18, ['number', ['get', 'D_COUR_M'], 5],
    19, ['*', 2, ['number', ['get', 'D_COUR_M'], 5]]
  ],
  'circle-color': '#aaaaaa',
  'circle-opacity': 0.5,
  'circle-stroke-color': '#888888',
  'circle-stroke-width': 1,
  'circle-stroke-opacity': 0.5
}

const measurePaint = (measure: string) => {
  return {
    'circle-radius': [
      'interpolate',
      ['linear'],
      ['zoom'],
      13, 2,
      // @ts-ignore
      14, ['*', 0.125, ['number', ['get', 'radius'], 5]],
      // @ts-ignore
      15, ['*', 0.25, ['number', ['get', 'radius'], 5]],
      // @ts-ignore
      16, ['*', 0.5, ['number', ['get', 'radius'], 5]],
      // @ts-ignore
      17, ['number', ['get', 'radius'], 5],
      // @ts-ignore
      18, ['*', 2, ['number', ['get', 'radius'], 5]],
      // @ts-ignore
      19, ['*', 4, ['number', ['get', 'radius'], 5]]
    ],
    'circle-color': ['string', ['get', `color_${measure}`], '#000000'],
    'circle-opacity': [
      'case',
      ['==', '#000000', ['get', `color_${measure}`]], 0,
      0.7
    ],
    'circle-stroke-color': '#888888',
    'circle-stroke-width': 1,
    'circle-stroke-opacity': 0.3
  }
}

const species = ref<SpeciesItem[]>([])

onMounted(() => {
  documentationIds.forEach((id: string) => {
    ["en", "fr"].forEach((lang) => {
      const lid = `${id}_${lang}`
      axios
        .get<string>(`${lid}.md`)
        .then((response) => response.data)
        .then((data) => {
          docHtml.value[lid] = DOMPurify.sanitize(marked.parse(data, {headerIds: false, mangle: false}))
      })
    })
  })

  axios
    .get(`${CDN_DATA_URL}/urbtrees_species_mean_sum_full.csv`)
    .then((response) => response.data)
    .then((data) => {
      Papa.parse(data, {
        delimiter: ',',
        header: true,
        dynamicTyping: true,
        complete: function(results: any) {
          species.value = results.data
            .filter((row: SpeciesItem) => row['GENRE_lat'] !== null)
            .map((row: SpeciesItem) => {
              row.id = row.NOM_COMPLET_lat.toLowerCase().replace(' ', '_')
              row.genus = row.GENRE_lat.toLowerCase().replace(' ', '_')
              row.measures = []
              // normalize locales
              row.GENRE_en = row.GENRE_eng
              row.NOM_COMPLET_en = row.NOM_COMPLET_eng
              if (row.mean_BVOC_kg) {
                row.measures.push('voc')
              }
              if (row.mean_PM10_kg) {
                row.measures.push('pm10')
              }
              if (row.mean_OFP_kg) {
                row.measures.push('ofp')
              }
              if (row.mean_O3_kg) {
                row.measures.push('o3')
              }
              return row
            })
        }
      })
    })  
});

watch(species, () => {
  axios
    .get<StyleSpecification>(props.styleUrl)
    .then((response) => response.data)
    .then((data) => {
      // deviceRatio == 1 then tileSize 256
      // deviceRatio === 2 then tileSize 128
      const newTileSize = 256 / (window.devicePixelRatio || 1)
      data.sources = Object.keys(data.sources).reduce((acc: any, key: string) => { acc[key] = {...data.sources[key], tileSize: newTileSize}; return acc;}, {})
      // append source/layer for each species read from the csv
      species.value.forEach((item) => {
        if (!data.sources[item.genus]) {
          
          // one source and layer for each genus (known specie)
          data.sources[item.genus] = {
            type: 'vector',
            url: `${MARTIN_URL}/genus_${item.genus}_true`
          }
          data.layers.push({
            id: item.genus,
            source: item.genus,
            'source-layer': `genus_${item.genus}_true`,            
            type: 'circle',
            // @ts-ignore
            paint: genusPaint,
            layout: { visibility: 'none' }
          })
          // one source and layer for each genus (unknown specie)
          data.sources[`${item.genus}_alt`] = {
            type: 'vector',
            url: `${MARTIN_URL}/genus_${item.genus}_false`
          }
          data.layers.push({
            id: `${item.genus}_alt`,
            source: `${item.genus}_alt`,
            'source-layer': `genus_${item.genus}_false`,
            type: 'circle',
            // @ts-ignore
            paint: genusPaint,
            layout: { visibility: 'none' }
          })
          // one layer per measure for the unkown species in the genus
          allMeasures.forEach((measure) => {
            data.layers.push({
              id: `${item.genus}_other_${measure}`,
              source: `${item.genus}_alt`,
              'source-layer': `genus_${item.genus}_false`,
              type: 'circle',
              // @ts-ignore
              paint: measurePaint(measure),
              layout: { visibility: 'none' }
            })
          })
        }
        // one source for the specie
        data.sources[item.id] = {
          type: 'vector',
          url: `${MARTIN_URL}/${item.id}`
        }
        // one layer per measure for the specie
        item.measures.forEach((measure) => {
          data.layers.push({
            id: `${item.id}_${measure}`,
            source: item.id,
            'source-layer': item.id,
            type: 'circle',
            // @ts-ignore
            paint: measurePaint(measure),
            layout: { visibility: 'none' }
          })
        })
      })
      style.value = data
    })
    .then(() => {
      axios
        .get<Parameters>(props.parametersUrl)
        .then((response) => response.data)
        .then((data) => {
          // append selectable for each species read from the csv
          const speciesItem = data.selectableItems?.find((item) => item.id === 'species') as SelectableGroupItem
          const allGenus: string[] = []
          species.value.forEach((item) => {
            speciesItem.children.push({
              id: item.id,
              ids: [item.genus, `${item.genus}_alt`],
              label: item.NOM_COMPLET_lat,
              label_en: item.NOM_COMPLET_en,
              label_fr: item.NOM_COMPLET_fr,
              legendImage: item.mean_PM10_kg && item.Net_O3 ? `${CDN_DATA_URL}/specie_${item.id}_graph.png` : undefined,
              measures: item.measures,
              genre: item.genus,
              selected: false
            })
            data.popupLayerIds?.push(item.id)
            if (data.popupLayerIds && !data.popupLayerIds.includes(item.genus)) {
              data.popupLayerIds.push(item.genus)
              data.popupLayerIds.push(`${item.genus}_alt`)
              allGenus.push(item.genus)
            }
            item.measures.forEach((measure) => data.popupLayerIds?.push(`${item.id}_${measure}`))
          })
          // add a layer for other species of each genus
          allGenus.forEach((genus) => {
            speciesItem.children.push({
              id: `${genus}_other`,
              ids: [genus, `${genus}_alt`],
              label: '',
              label_en: 'Unknown',
              label_fr: 'Inconnue',
              measures: allMeasures,
              genre: genus,
              selected: false
            })
            data.popupLayerIds?.push(`${genus}_other`)
            allMeasures.forEach((measure) => data.popupLayerIds?.push(`${genus}_other_${measure}`))
          })
          parameters.value = data
          triggerRef(parameters)
          triggerRef(style)
          map.value?.update(data.center, data.zoom)
        })
    })
})

const singleItems = computed<SelectableSingleItem[]>(() =>
  (parameters.value?.selectableItems ?? [])
    .filter((item: SelectableItem) => item.id !== 'theme')
    .flatMap((item: SelectableItem) =>
      'children' in item ? item.children : [item]
    )
)

const themeItems = computed<SelectableSingleItem[]>(() => {
  const themeGroup = parameters.value?.selectableItems?.find((item: SelectableItem) => item.id === 'theme') as SelectableGroupItem
  return themeGroup ? themeGroup.children : []
})

const selectableLayerIds = computed<string[]>(() => singleItems.value.map((item) => item.id))
const selectedItemWithLegend = computed(() =>
  singleItems.value
    .filter((item: SelectableSingleItem) => selectedLayerIds.value.some((id: string) => item.id === id))
    .filter((item: SelectableSingleItem) => item.legend !== undefined || item.legendImage !== undefined || item.legendScaleId !== undefined || item.measures)
    .pop()
)
const selectedSpecie = computed(() => getSpecie(selectedItemWithLegend.value))

const extendedSelectedLayerIds = computed<string[]>(() => {
  const addtionalIds: string[] = showAllSpecies.value ? singleItems.value
    .filter((item: SelectableSingleItem) => item.ids && selectedLayerIds.value.includes(item.id))
    .flatMap((item: SelectableSingleItem) => item.ids) : []
  const measureLayerIds: string[] = selectedLayerIds.value.map((id) => `${id}_${scale.value}`)
  const ids: string[] = [selectedLayerIds.value, measureLayerIds, addtionalIds].flat().filter((value, index, array) => array.indexOf(value) === index)
  return ids
})

const scaleItems = computed<{ id: string; title: string }[] | undefined>(() => parameters.value?.legendScales?.
  filter((scl) => selectedItemWithLegend.value && selectedItemWithLegend.value.measures.includes(scl.id))
  .map((scl) => {
    return {
      id: scl.id,
      title: t(scl.id)
    }
  }))

watch(() => selectedLayerIds.value, () => {
  if (scale.value === undefined || !scaleItems.value?.map(scl => scl.id).includes(scale.value)) {
    if (scaleItems.value && scaleItems.value.length > 0) {
      scale.value = scaleItems.value?.[0].id
    }
  }
})

function getSpecie(sel: SelectableSingleItem | undefined) {
  return sel ? species.value.filter((item) => item.id === sel.id).pop() : undefined
}

function onOpenLegendDialog(item: SelectableSingleItem) {
  const label = (item as any)['label_' + locale.value]
  legendDialogTitle.value = `${item.label} (${label})`
  legendDialogImageSrc.value = item.legendImage
  legendDialog.value = true
}

function getLegendTitle(id: string, withUnit: boolean): string | undefined {
  const scale = parameters.value?.legendScales?.find((scale: LegendScale) => scale.id === id)
  if (scale) { 
    if (withUnit && scale.unit) {
      return `${t(scale.id)} (${t(scale.unit)})`
    }
    return t(scale.id)
  }
  return undefined
}

function showDocumentation(id: string) {
  const lid = `${id}_${locale.value}`
  if (docId.value === lid) {
    drawerRight.value = !drawerRight.value
  } else {
    if (lid in docHtml.value) {
      drawerHtml.value = docHtml.value[lid]
    } else {
      drawerHtml.value = `Ooops, there is no documentation about '${id}'`
    }
    docId.value = lid
    drawerRight.value = true
  }
}

function selectSpecie(id: string) {
  const tokens = id.split(':')
  selector.value?.update(tokens[0], tokens[1])
}

function formatNumber(nb: number) {
  return new Intl.NumberFormat(`${locale.value}`).format(Math.round(nb * 100) / 100)
}

function isMeasurePositive(measure: string) {
  return ['voc', 'ofp'].includes(measure)
}

function getSpecieMeasureMeanLabel(sel: SpeciesItem, measure: string) {
  const field = `mean_${measure === 'voc' ? 'BVOC' : measure.toUpperCase()}_kg`
  const val = formatNumber((sel as any)[field])
  return val
}

function getSpecieMeasureSumLabel(sel: SpeciesItem, measure: string) {
  const field = `sum_${measure === 'voc' ? 'BVOC' : measure.toUpperCase()}_kg`
  const val = formatNumber((sel as any)[field])
  return val
}

</script>

<template>
  <v-navigation-drawer :rail="drawerRail" permanent :width="mobile ? 300 : 450" @click="drawerRail = false">
    <v-list density="compact" nav>
      <v-list-item :prepend-icon="drawerRail ? mdiChevronRight : undefined">
        <template #append>
          <v-btn :icon="mdiChevronLeft" variant="flat" @click.stop="drawerRail = true" />
        </template>
      </v-list-item>
      <v-list-item :prepend-icon="mdiLayers">
        <v-list-item-title>
          <span :class="mobile ? 'text-subtitle-1' : 'text-h6'">{{ $t('layers') }}</span>
        </v-list-item-title>
      </v-list-item>
      <v-list-item v-show="!drawerRail">
        <LayerSelector
          ref="selector"
          v-model="selectedLayerIds"
          :items="parameters?.selectableItems"
          :species="species"
          @documentation="(type) => showDocumentation(type)"
        />
        <v-checkbox
          v-if="selectedLayerIds.length === 1"
          v-model="showAllSpecies"
          density="compact"
          :label="$t('show_all_species')">
        </v-checkbox>
      </v-list-item>
      <v-list-item v-if="selectedItemWithLegend" :prepend-icon="mdiRuler">
        <v-list-item-title>
          <span :class="mobile ? 'text-subtitle-1' : 'text-h6'">{{ $t('measures') }}</span>
        </v-list-item-title>
      </v-list-item>
      <v-list-item v-if="!drawerRail && selectedItemWithLegend">
        <v-card>
          <v-card-text class="pa-0">
            <v-row>
              <v-col cols="12">
                <v-select
                  v-model="scale"
                  :label="$t('measure')"
                  :items="scaleItems"
                  item-title="title"
                  item-value="id"
                  density="compact"
                  class="mt-2"
                ></v-select>

                <div v-if="selectedSpecie">
                  <v-responsive>
                    <v-table density="compact" class="mb-2">
                      <thead>
                        <tr>
                          <th></th>
                          <th></th>
                          <th>{{ $t('mean') }}</th>
                          <th>{{ $t('sum') }}</th>
                        </tr>
                      </thead>
                      <tbody>
                        <template v-for="measure in selectedSpecie.measures" :key="measure">
                          <tr>
                            <td class="text-caption pr-0">
                              {{ getLegendTitle(measure, false) }}
                            </td>
                            <td class="pa-0">
                              <v-btn :icon="mdiInformation" flat size="small" @click="showDocumentation(measure)"></v-btn>
                            </td>
                            <td class="text-no-wrap pr-0" :class="isMeasurePositive(measure) ? 'text-red' : 'text-green'">
                              {{ getSpecieMeasureMeanLabel(selectedSpecie, measure) }} kg
                            </td>
                            <td class="text-no-wrap" :class="isMeasurePositive(measure) ? 'text-red' : 'text-green'">
                              {{ getSpecieMeasureSumLabel(selectedSpecie, measure) }} kg
                            </td>
                          </tr>
                        </template>
                      </tbody>
                    </v-table>
                  </v-responsive>
                  <div class="mb-5 text-caption text-grey-darken-1">{{ $t('annual_contrib') }}</div>
                </div>

                <div v-if="selectedItemWithLegend.legend" class="mb-5 text-caption">{{ selectedItemWithLegend.legend }}</div>
                <div v-if="selectedItemWithLegend.legendImage" class="mb-5">
                  <v-hover v-slot="{ isHovering, props }">
                    <v-card
                      elevation="0"
                      class="v-card-image mb-2"
                      :class="{ 'on-hover': isHovering }"
                      v-bind="props"
                    >
                    <v-img :src="selectedItemWithLegend.legendImage" @click="onOpenLegendDialog(selectedItemWithLegend)">
                      <v-card-title class="d-flex justify-center align-self-auto" primary-title>
                          <v-btn
                            color="primary"
                            class="mt-4"
                            :prepend-icon="mdiOpenInNew"
                            style="z-index: 9999"
                            @click.stop="onOpenLegendDialog(selectedItemWithLegend)">
                            {{ $t('view') }}
                          </v-btn>
                      </v-card-title>
                    </v-img>
                    </v-card>
                  </v-hover>
                  <div>
                    <span class="text-caption text-grey-darken-1">{{ $t('graph_caption') }}</span>
                    <v-btn :icon="mdiInformation" flat size="small" @click="showDocumentation('graph')"></v-btn>
                  </div>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-list-item>
      <v-list-item :prepend-icon="mdiMapLegend">
        <v-list-item-title>
          <span :class="mobile ? 'text-subtitle-1' : 'text-h6'">{{ $t('legend') }}</span>
        </v-list-item-title>
      </v-list-item>
      <v-list-item v-if="!drawerRail">
        <v-row>
          <v-col cols="2">
            <v-icon :icon="mdiCircle" color="#482878" size="50"></v-icon>
            <v-icon :icon="mdiCircle" color="#1f9e89" size="40" class="mt-1 ml-1 mr-1"></v-icon>
            <v-icon :icon="mdiCircle" color="#fde725" size="30" class="mt-1 ml-2 mr-2"></v-icon>
            <v-icon :icon="mdiCircleOutline" color="grey" size="30" class="mt-1 ml-2 mr-2"></v-icon>
          </v-col>
          <v-col cols="10" class="text-caption text-grey-darken-1">
            <div>{{ $t('tree_legend') }}</div>
            <div>{{ $t('tree_legend_considered') }}</div>
            <div>{{ $t('tree_legend_not_considered') }}</div>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="2" class="text-center">
            <v-icon :icon="mdiCircle" color="grey" size="30"></v-icon>
          </v-col>
          <v-col cols="10">
            <span class="text-caption text-grey-darken-1">{{ $t('tree_considered') }}</span>
          </v-col>
        </v-row>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
  <v-navigation-drawer v-if="drawerRight" permanent location="right" :width="mobile ? 200 : 400">
    <v-list>
      <v-list-item>
        <template #append>
          <v-btn :icon="mdiClose" variant="flat" @click.stop="drawerRight = false" />
        </template>
      </v-list-item>
      <v-list-item>
        <v-card>
          <v-card-text v-html="drawerHtml" class="marked">
          </v-card-text>
        </v-card>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
  <v-container class="fill-height pa-0" fluid>
    <v-row class="fill-height">
      <v-col cols="12" class="py-0">
        <MapLibreMap
          ref="map"
          :center="parameters?.center"
          :zoom="parameters?.zoom"
          :max-zoom="parameters?.maxZoom"
          :min-zoom="parameters?.minZoom"
          :style-spec="style"
          :themes="themeItems"
          :scales="parameters?.legendScales"
          :selectable-layer-ids="selectableLayerIds"
          :selected-layer-ids="extendedSelectedLayerIds"
          :popup-layer-ids="parameters?.popupLayerIds"
          :selected-scale-id="scale"
          @documentation="(type) => showDocumentation(type)"
          @specie="(specie) => selectSpecie(specie)"
        />
      </v-col>
    </v-row>

    <v-dialog
      v-model="legendDialog"
      fullscreen
    >
      <v-card>
        <v-toolbar
          color="grey-lighten-4"
        >
          <v-btn
            :icon="mdiClose"
            @click="legendDialog = false"
          >
          </v-btn>
          <v-toolbar-title>
            {{ legendDialogTitle }}
          </v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <v-img :src="legendDialogImageSrc"/>
        </v-card-text>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<style lang="scss">
.v-navigation-drawer {
  border-right: 1px solid rgb(var(--v-theme-primary)) !important;
}
.v-card-image:not(.on-hover) {
  opacity: 0.6;
}
</style>
