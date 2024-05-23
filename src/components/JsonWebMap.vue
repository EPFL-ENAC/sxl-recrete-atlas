 <script setup lang="ts">
import MapLibreMap from '@/components/MapLibreMap.vue'
import ProjectFilters from '@/components/ProjectFilters.vue'
import type { Parameters } from '@/utils/jsonWebMap'
import type {
  SelectableGroupItem,
  SelectableItem,
  SelectableSingleItem
} from '@/utils/layerSelector'
import { mdiChevronLeft, mdiChevronRight, mdiClose } from '@mdi/js'
import axios from 'axios'
import type { StyleSpecification } from 'maplibre-gl'
import { computed, defineModel, onMounted, ref, shallowRef, triggerRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDisplay } from 'vuetify'
import type { Project } from '@/types/Project'

import { useProjectsStore } from '@/stores/projects'
import BarProjectEchart from './BarProjectEchart.vue'
import { storeToRefs } from 'pinia'

const props = defineProps<{
  styleUrl: string
  parametersUrl: string
  cdnUrl: string
  martinUrl: string
}>()

const { t } = useI18n({ useScope: 'global' })

const map = ref<InstanceType<typeof MapLibreMap>>()
const selectedLayerIds = ref<string[]>([])
const style = shallowRef<StyleSpecification>()
const parameters = shallowRef<Parameters>()
const legendDialog = ref(false)
const legendDialogTitle = ref<string>()
const legendDialogImageSrc = ref<string>()
const drawerRail = ref(false)
const drawerRight = ref(false)
const drawerHtml = ref('')
const { mobile } = useDisplay()
const scale = ref<string>()


const isProjectDialogOpen = defineModel('isProjectDialogOpen', {
  type: Boolean,
  default: false
})

const project = defineModel<Project, string >('project', {
  default: undefined,
  type: Object,
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
})

const singleItems = computed<SelectableSingleItem[]>(() =>
  (parameters.value?.selectableItems ?? [])
    .filter((item: SelectableItem) => item.id !== 'theme')
    .flatMap((item: SelectableItem) => ('children' in item ? item.children : [item]))
)

const themeItems = computed<SelectableSingleItem[]>(() => {
  const themeGroup = parameters.value?.selectableItems?.find(
    (item: SelectableItem) => item.id === 'theme'
  ) as SelectableGroupItem
  return themeGroup ? themeGroup.children : []
})

const selectableLayerIds = computed<string[]>(() => singleItems.value.map((item) => item.id))
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
const extendedSelectedLayerIds = computed<string[]>(() => {
  const addtionalIds: string[] = []
  const measureLayerIds: string[] = selectedLayerIds.value.map((id) => `${id}_${scale.value}`)
  const ids: string[] = [selectedLayerIds.value, measureLayerIds, addtionalIds]
    .flat()
    .filter((value, index, array) => array.indexOf(value) === index)
  return ids
})

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

const projects = storeToRefs(useProjectsStore()).projects

</script>

<template>
  <!-- eslint-disable vue/no-v-text-v-html-on-component -->
  <!-- eslint-disable vue/no-v-html -->
  <v-navigation-drawer
    :rail="drawerRail"
    permanent
    :width="mobile ? 300 : 450"
    class="permanent-drawer"
    @click="drawerRail = false"
  >
    <v-list density="compact" nav>
      <v-list-item>
        <template v-if="!drawerRail" #append>
          <v-btn
            :icon="mdiChevronLeft"
            variant="flat"
            density="compact"
            @click.stop="drawerRail = true"
          />
        </template>
        <template v-if="drawerRail" #prepend >
          <v-btn
            :icon="mdiChevronRight"
            variant="flat"
            density="compact"
            @click.stop="drawerRail = false"
          />
        </template>
      </v-list-item>
      <project-filters :is-visible="!drawerRail" />
    </v-list>

    <v-sheet v-if="!drawerRail" class="pa-0">
      <BarProjectEchart :projects="projects" />
    </v-sheet>

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
          // eslint-disable-next-line vue/no-v-html
          <v-card-text class="marked" v-html="drawerHtml"> </v-card-text>
        </v-card>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
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
          :themes="themeItems"
          :scales="parameters?.legendScales"
          :selectable-layer-ids="selectableLayerIds"
          :selected-layer-ids="extendedSelectedLayerIds"
          :popup-layer-ids="parameters?.popupLayerIds"
          :selected-scale-id="scale"
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

<style lang="scss">
.v-navigation-drawer {
  border-right: 1px solid rgb(var(--v-theme-primary)) !important;
}
.v-card-image:not(.on-hover) {
  opacity: 0.6;
}
.permanent-drawer {
  :deep(.v-navigation-drawer__content) {
    z-index: 1000;
    display: grid;
    grid-template-rows: auto 200px;
    grid-gap: 1rem;
  }
}

</style>
