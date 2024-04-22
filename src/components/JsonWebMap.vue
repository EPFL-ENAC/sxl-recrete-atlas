<script setup lang="ts">
import type LayerSelector from '@/components/LayerSelector.vue'
import MapLibreMap from '@/components/MapLibreMap.vue'
import ProjectFilters from '@/components/ProjectFilters.vue'
import type { Parameters, LegendScale } from '@/utils/jsonWebMap'
import { mdiChevronLeft, mdiChevronRight, mdiClose, mdiLayers, mdiMapLegend, mdiRuler, mdiCircle, mdiCircleOutline, mdiOpenInNew, mdiInformation } from '@mdi/js'
import type { SelectableGroupItem, SelectableItem, SelectableSingleItem, SpeciesItem } from '@/utils/layerSelector'
import axios from 'axios'
import { marked } from 'marked'
import { useDisplay } from 'vuetify'
import { computed, onMounted, ref, shallowRef, triggerRef, watch, defineModel } from 'vue'
import { useI18n } from 'vue-i18n'
import type { StyleSpecification } from 'maplibre-gl'
// @ts-ignore
import { useCookies } from 'vue3-cookies'

const props = defineProps<{
  styleUrl: string
  parametersUrl: string
  cdnUrl: string
  martinUrl: string
}>()


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

const species = ref<SpeciesItem[]>([])

const isProjectDialogOpen = defineModel('isProjectDialogOpen',{
  type: Boolean,
  default: false,
})

const project = defineModel('project',{
  type: Boolean,
  default: false,
})


onMounted(() => {
  axios
    .get<StyleSpecification>(props.styleUrl)
    .then((response) => response.data)
    .then((data) => {
      style.value = data
    })
    .then(() => {
      axios
        .get<Parameters>(props.parametersUrl)
        .then((response) => response.data)
        .then((data) => {
          parameters.value = data
          triggerRef(parameters)
          triggerRef(style)
          map.value?.update(data.center, data.zoom)
        })
    })
});


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
     
      <project-filters />
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
          v-model:isProjectDialogOpen="isProjectDialogOpen"
          v-model:project="project"
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
