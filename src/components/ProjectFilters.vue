<script setup lang="ts">
import { mdiMapLegend } from '@mdi/js'
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDisplay } from 'vuetify'
import { useFiltersStore } from '@/stores/filters';
import { storeToRefs } from 'pinia';
import type { Project, ProjectKey } from '@/types/Project';
import {
  mdiClose
} from '@mdi/js'
import keys from '@/assets/data/keys.json'
import data from '@/assets/data/data.json'


const { t, locale } = useI18n({ useScope: 'global' })
const { mobile } = useDisplay()

interface FilterSelect {
  key: ProjectKey
  values: (string | number)[]
}

const projects = (data as Project[]);
function getValues(key: ProjectKey): (string | number)[] {
    const projectValues = projects.map((project: Project) => project[key]);
    const uniqueValues = Array.from(new Set(projectValues));
    return uniqueValues.filter(value => typeof value === 'string' || typeof value === 'number');
  }
// a.filter(x => x.Filtres === 'oui').map(x => x.key)
const filterSelectKeys: ProjectKey[] = keys.filter(x => x.Filtres === 'oui').map(x => x.key as ProjectKey)
const filtersSelect: FilterSelect[] = filterSelectKeys.map(key => ({
  key,
  values: getValues(key)
}))

// [
//   { key: 'main_concrete_type', values: ['PC', 'CIP'] },
//   { key: 'receiver_country', values: ['DE', 'SE', 'FR', 'IT'] },
//   { key: 'donor_use', values: ['Bridge', 'Building', 'Tunnel', 'Other'] },
//   { key: 'donor_element_type', values: ['Beam', 'Column', 'Slab', 'Wall'] },
//   { key: 'receiver_use', values: ['Bridge', 'Building', 'Tunnel', 'Other'] },
//   { key: 'receiver_element_type', values: ['Beam', 'Column', 'Slab', 'Wall'] }
// ]

interface FilterRange {
  key: ProjectKey
  values: number[]
}
// a.filter(x => x.Filtres === 'range').map(x => x.key)
const filtersRange: FilterRange[] = [
  { key: 'distance_km', values: [0, 100] },
  { key: 'start_date_year', values: [0, 100] },
  { key: 'component_age', values: [0, 100] },
  { key: 'donor_nb_floor', values: [0, 100] },
  { key: 'receiver_nb_floor', values: [0, 100] },
]

const main_concrete_type = ref<any>({
  PC: 'Precast',
  CIP: 'Cast in place'
})

// a.filter(x => x.Filtres === 'with/without').map(x => x.key)

const store = useFiltersStore()
const { filters } = storeToRefs(store)
const { setFilters } = store

function resetFilter() {
  setFilters({
    name: '',
  })
}
// const filters = computed({
//   get: () => store.getFilters,
//   set: (value) => store.setFilters(value)
// })

const props = withDefaults(
  defineProps<{
    isVisible?: boolean
  }>(),
  {
    isVisible: false
  }
)
</script>

<template>
  <v-list-item :prepend-icon="mdiMapLegend">
    <v-list-item-title v-show="props.isVisible" class="d-flex justify-space-between">
      <span :class="mobile ? 'text-subtitle-1' : 'text-h6'">{{ $t('filters') }}</span>
      <v-btn class="mb-4" size="x-small" @click="resetFilter" :icon="mdiClose">
      </v-btn>
    </v-list-item-title>
  </v-list-item>
  <v-list-item v-show="props.isVisible">
    <v-row>
      <v-col cols="6">
        {{ $t('search') }}
      </v-col>
      <v-col cols="6">
        <v-text-field
v-model:model-value="filters.name" :clearable="true"
          @update:model-value="() => setFilters(filters)" />
      </v-col>
    </v-row>
  </v-list-item>
  <v-list-item v-for="(filter, $key) in filtersSelect" v-show="props.isVisible" :key="$key">
    <v-row>
      <v-col cols="6">
        {{ $t(`project_${filter.key}`) }}
      </v-col>
      <v-col cols="6">
        <v-select
          :model-value="filters[filter.key] as any"
          :clearable="true" multiple
          chips :items="filter.values" @update:model-value="() => setFilters(filters)" />
      </v-col>
    </v-row>
  </v-list-item>
  <v-list-item v-for="(filter, $key) in filtersRange" v-show="props.isVisible" :key="$key">
    <v-row class="row-range">
      <v-col cols="6">
        {{ $t(`project_${filter.key}`) }}
      </v-col>
      <v-col cols="6" class="d-flex align-end">
        <v-range-slider
        clearable multiple chips
        thumb-label="always"
        v-model="filters[filter.key] as any"
        :items="filter.values" @update:model-value="() => setFilters(filters)" />
      </v-col>
    </v-row>
  </v-list-item>
</template>

<style lang="scss">
.row-range {
  height: 91px;
}
</style>
