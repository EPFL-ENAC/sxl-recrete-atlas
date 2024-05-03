<script setup lang="ts">
import { mdiMapLegend } from '@mdi/js'
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDisplay } from 'vuetify'
import { useFiltersStore } from '@/stores/filters';
import { storeToRefs } from 'pinia';
import type { Project, ProjectKey } from '@/types/Project';
import type { Filter, FilterKey, RangeFilter, RangeFilterKey, SelectFilterKey } from '@/types/Filter'

import {
  mdiClose
} from '@mdi/js'
import keys from '@/assets/data/keys.json'
import data from '@/assets/data/data.json'


const { t, locale } = useI18n({ useScope: 'global' })
const { mobile } = useDisplay()

interface FilterSelectValues {
  key: SelectFilterKey
  values: string[]
}

const projects = (data as Project[]);
function getSelectValues(key: ProjectKey): (string)[] {
    const projectValues = projects.map((project: Project) => project[key]);
    const uniqueValues = Array.from(new Set(projectValues));
    return uniqueValues.filter(value => typeof value === 'string') as string[];
  }

const filterSelectKeys: SelectFilterKey[] = keys.filter(x => x.Filtres === 'oui').map(x => x.key as SelectFilterKey)
const filtersSelect: FilterSelectValues[] = filterSelectKeys.map((key: SelectFilterKey) => ({
  // example: { key: 'main_concrete_type', values: ['PC', 'CIP'] },
  key,
  values: getSelectValues(key)
}))

interface FilterRangeValues {
  key: RangeFilterKey 
  values: number[]
}

function getRangeValues(key: FilterKey): number[] {
    const projectValues = projects.map((project: Project) => project[key]);
    const uniqueValues: number[] = Array.from(new Set(projectValues))
    .filter(value => typeof value === 'number') as number[];
    // [0, 100]
    console.log(Array.from(new Set(projectValues)))
    return [Math.min(...uniqueValues), Math.max(...uniqueValues)];
  }

const filtersRangeKeys: RangeFilterKey[] = keys.filter(x => x.Filtres === 'range').map(x => x.key as RangeFilterKey)
const filtersRange: FilterRangeValues[] = filtersRangeKeys.map((key: RangeFilterKey) => ({
  // example: { key: 'distance_km', values: [0, 100] },
  key,
  values: getRangeValues(key)
}))


// function isNumberArray(value: any): value is [min: number, max: number] {
//   return Array.isArray(value) && value.length === 2 && typeof value[0] === 'number' && typeof value[1] === 'number';
// }


console.log(filtersRange)

const main_concrete_type = ref<any>({
  PC: 'Precast',
  CIP: 'Cast in place'
})

// a.filter(x => x.Filtres === 'with/without').map(x => x.key)

const store = useFiltersStore()
const { filters } = storeToRefs(store)
const { setFilters, resetFilter } = store

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
          :model-value="filters.name" density="compact"
          :clearable="true"
          @update:model-value="() => setFilters(filters)"
        />
      </v-col>
    </v-row>
  </v-list-item>
  <v-list-item v-for="(filtersSelect, $key) in filtersSelect" v-show="props.isVisible" :key="$key">
    <v-row>
      <v-col cols="6">
        {{ $t(`project_${filtersSelect.key}`) }}
      </v-col>
      <v-col cols="6">
        <v-select
          v-model="filters[filtersSelect.key]"
          :clearable="true" multiple density="compact"
          chips :items="filtersSelect.values" @update:model-value="() => setFilters(filters)" />
      </v-col>
    </v-row>
  </v-list-item>
  <v-list-item v-for="(filterRange, $key) in filtersRange" v-show="props.isVisible" :key="$key">
    <v-row class="row-range">
      <v-col cols="6">
        {{ $t(`project_${filterRange.key}`) }}
      </v-col>
      <v-col cols="6" class="d-flex align-end">
        <!-- v-model="filters[filter.key]" -->
        <v-range-slider
          v-model="filters[filterRange.key]"
          thumb-label="always" density="compact"
          :min="filterRange.values[0]"
          :max="filterRange.values[1]"
        />
      </v-col>
    </v-row>
  </v-list-item>
</template>

<style lang="scss">
.row-range {
  height: 91px;
}
</style>
