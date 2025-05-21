<script setup lang="ts">
import MapLibreMap from '@/components/MapLibreMap.vue'
import ProjectFilters from '@/components/ProjectFilters.vue'
import type { Parameters } from '@/utils/jsonWebMap'
import type {
  SelectableItem,
  SelectableSingleItem
} from '@/utils/layerSelector'
import { mdiClose } from '@mdi/js'
import axios from 'axios'
import type { StyleSpecification } from 'maplibre-gl'
import { computed, defineModel, onMounted, ref, shallowRef, triggerRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Project } from '@/types/Project'

const props = defineProps<{
  styleUrl: string
  parametersUrl: string
}>()

const { t } = useI18n({ useScope: 'global' })

const map = ref<InstanceType<typeof MapLibreMap>>()
const selectedLayerIds = ref<string[]>([])
const style = shallowRef<StyleSpecification>()
const parameters = shallowRef<Parameters>()
const legendDialog = ref(false)
const legendDialogTitle = ref<string>()
const legendDialogImageSrc = ref<string>()
const scale = ref<string>()

const isProjectDialogOpen = defineModel('isProjectDialogOpen', {
  type: Boolean,
  default: false
})

const project = defineModel<Project, string>('project', {
  default: undefined,
  type: Object
})

onMounted(() => {
  axios
    .get<StyleSpecification>(props.styleUrl)
    .then((response) => response.data)
    .then((data) => {
      const newTileSize = 256 / (window.devicePixelRatio || 1)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data.sources = Object.keys(data.sources).reduce((acc: any, key: string) => {
        acc[key] = { ...data.sources[key], tileSize: newTileSize }
        return acc
      }, {})
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
})

const singleItems = computed<SelectableSingleItem[]>(() =>
  (parameters.value?.selectableItems ?? [])
    .filter((item: SelectableItem) => item.id !== 'theme')
    .flatMap((item: SelectableItem) => ('children' in item ? item.children : [item]))
)


const selectedItemWithLegend = computed(() =>
  singleItems.value
    .filter((item: SelectableSingleItem) =>
      selectedLayerIds.value.some((id: string) => item.id === id)
    )
    .filter(
      (item: SelectableSingleItem) =>
        item.legend !== undefined ||
        item.legendImage !== undefined ||
        item.legendScaleId !== undefined ||
        item.measures
    )
    .pop()
)

const scaleItems = computed<{ id: string; title: string }[] | undefined>(() =>
  parameters.value?.legendScales
    ?.filter(
      (scl) =>
        selectedItemWithLegend.value && selectedItemWithLegend.value.measures.includes(scl.id)
    )
    .map((scl) => {
      return {
        id: scl.id,
        title: t(scl.id)
      }
    })
)

watch(
  () => selectedLayerIds.value,
  () => {
    if (
      scale.value === undefined ||
      !scaleItems.value?.map((scl) => scl.id).includes(scale.value)
    ) {
      if (scaleItems.value && scaleItems.value.length > 0) {
        scale.value = scaleItems.value?.[0].id
      }
    }
  }
)

</script>

<template>
  <project-filters />
  <v-container class="fill-height pa-0" fluid>
    <v-row class="fill-height">
      <v-col cols="12" class="py-0">
        <MapLibreMap
          ref="map"
          v-model:isProjectDialogOpen="isProjectDialogOpen"
          v-model:project="project"
          :center="parameters?.center"
          :zoom="parameters?.zoom"
          :max-zoom="parameters?.maxZoom"
          :min-zoom="parameters?.minZoom"
          :style-spec="style"
          :popup-layer-ids="parameters?.popupLayerIds"
        />
      </v-col>
    </v-row>

    <v-dialog v-model="legendDialog" fullscreen>
      <v-card>
        <v-toolbar color="grey-lighten-4">
          <v-btn :icon="mdiClose" @click="legendDialog = false"> </v-btn>
          <v-toolbar-title>
            {{ legendDialogTitle }}
          </v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <v-img :src="legendDialogImageSrc" />
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped lang="scss">
.v-card-image:not(.on-hover) {
  opacity: 0.6;
}
</style>
