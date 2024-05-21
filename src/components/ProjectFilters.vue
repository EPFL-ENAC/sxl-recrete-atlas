<script setup lang="ts">
import { mdiMapLegend } from '@mdi/js'
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDisplay } from 'vuetify'
import { useFiltersStore, stepsHash, valuesHash, newFilter } from '@/stores/filters';
import { storeToRefs } from 'pinia';
import type { Project, ProjectKey, ProjectLang } from '@/types/Project';
import type { BooleanFilterKey, FilterKey, RangeFilterKey, SelectFilterKey } from '@/types/Filter'

import {
  mdiClose
} from '@mdi/js'
import keys from '@/assets/data/keys.json'
import data from '@/assets/data/data.json'


const { t, locale } = useI18n({ useScope: 'global' })
const { mobile } = useDisplay()

interface FilterSelectValues {
  key: SelectFilterKey
  values: (string | OptionValues)[]
}

const projects = (data as Project[]);
interface OptionValues {
  title: string;
  value: string;
}
function getSelectValues(key: ProjectKey): (OptionValues)[] {
    const projectValues = projects.map((project: Project) => project[key]);
    const isString = (value: unknown): value is string => typeof value === 'string';
    const isArray = (value: unknown): value is string[] => Array.isArray(value);
    const uniqueValuesString: string[] = Array.from(new Set(projectValues))
    .filter(isString);
    const uniqueValuesStringArray: string[] = Array.from(new Set((Array.from(new Set(projectValues))
    .filter(isArray).flat())));
    
    let uniqueValues: string[] = [];
    if (uniqueValuesStringArray.length > 0) {
      uniqueValues = uniqueValuesStringArray;
    }
    if (uniqueValuesString.length > 0) {
      uniqueValues = uniqueValuesString;
    }
    return uniqueValues
    .map((uniqueValue: string) => ({
      title: t(uniqueValue) as string,
      value: uniqueValue as string,
    }));
  }

const filterSelectKeys: SelectFilterKey[] = keys.filter(x => x.Filtres === 'oui').map(x => x.key as SelectFilterKey)

const filtersSelect = computed<FilterSelectValues[]>(() => filterSelectKeys.map((key: SelectFilterKey) => ({
  // example: { key: 'main_concrete_type', values: ['PC', 'CIP'] },
  key,
  values: getSelectValues(key)
})))


interface FilterRangeValues {
  key: RangeFilterKey 
  values: number[]
  step?: number
}

function getRangeValues(key: FilterKey): number[] {
    const projectValues = projects.map((project: Project) => {
      if (key === 'name') {
        return project[`name_${locale.value as ProjectLang}`];
      }
      return project[key];
    });
    const uniqueValues: number[] = Array.from(new Set(projectValues))
    .filter(value => typeof value === 'number') as number[];
    // [0, 100]
    return [Math.min(...uniqueValues), Math.max(...uniqueValues)];
  }


const filtersRangeKeys: RangeFilterKey[] = keys.filter(x => x.Filtres === 'range').map(x => x.key as RangeFilterKey)

const filtersRange: FilterRangeValues[] = filtersRangeKeys.map((key: RangeFilterKey) => ({
  // example: { key: 'distance_km', values: [0, 100] },
  key,
  values: valuesHash?.[key] ?? getRangeValues(key),
  step: stepsHash?.[key] ?? 1
}))

const filtersBoolean: BooleanFilterKey[] = keys.filter(x => x.Filtres === 'with/without').map(x => x.key as BooleanFilterKey)

const store = useFiltersStore()
const { filters } = storeToRefs(store)
const { setFilters, resetFilter } = store

const defaultFilter = newFilter()
const props = withDefaults(
  defineProps<{
    isVisible?: boolean
  }>(),
  {
    isVisible: false
  }
)

type FilterActivated = Record<FilterKey, boolean>

const filtersActivated = computed<FilterActivated>(() => {
  return (Object.keys(defaultFilter) as FilterKey[]).reduce((acc: FilterActivated, key: FilterKey) => {
    if (filters.value[key] == undefined) {
      acc[key] = true;
      return acc;
    }
    if (Array.isArray(filters.value[key])) {
      acc[key] = JSON.stringify(filters.value[key]) === JSON.stringify(defaultFilter[key]);
      return acc;
    }
    if (typeof filters.value[key] === 'boolean') {
      acc[key] = filters.value[key] === defaultFilter[key];
      return acc;
    }
    acc[key] = filters.value[key] === defaultFilter[key];

    return acc;
  }, {} as FilterActivated);
})

watch(filters, (newVal) => {
  setFilters(newVal);
}, {
  deep: true
});

</script>

<template>
  <v-list-item :prepend-icon="mdiMapLegend">
    <v-list-item-title v-show="props.isVisible" class="d-flex justify-space-between">
      <span :class="mobile ? 'text-subtitle-1' : 'text-h6'">{{ $t('filters') }}</span>
      <v-btn class="mb-4" size="x-small" :icon="mdiClose" @click="resetFilter">
      </v-btn>
    </v-list-item-title>
  </v-list-item>
  <v-list-item v-show="props.isVisible">
    <v-row>
      <v-col cols="6" :class="{ 'text-grey': filtersActivated.name }">
        {{ $t('search') }}
      </v-col>
      <v-col cols="6">
        <v-text-field
          v-model="filters.name" density="compact"
          :clearable="true"
        />
      </v-col>
    </v-row>
  </v-list-item>
  <v-list-item v-for="(filterSelect, $key) in filtersSelect" v-show="props.isVisible" :key="$key">
    <v-row>
      <v-col cols="6"  :class="{ 'text-grey': filtersActivated[filterSelect.key] }">
        {{ $t(filterSelect.key) }}
      </v-col>
      <v-col cols="6">
        <v-select
          v-model="filters[filterSelect.key]"
          :clearable="true" multiple density="compact"
          chips :items="filterSelect.values" @update:model-value="() => setFilters(filters)" />
      </v-col>
    </v-row>
  </v-list-item>
  <v-list-item v-for="(filterRange, $key) in filtersRange" v-show="props.isVisible" :key="$key">
    <v-row class="row-range">
      <v-col cols="6" :class="{ 'text-grey': filtersActivated[filterRange.key] }">
        {{ $t(filterRange.key) }}
      </v-col>
      <v-col cols="6" class="d-flex align-end">
        <v-range-slider
          v-model="filters[filterRange.key]"
          :thumb-label="!filtersActivated[filterRange.key] ? 'always': undefined" density="compact"
          :step="filterRange.step"
          :min="filterRange.values[0]"
          :max="filterRange.values[1]"
        />
      </v-col>
    </v-row>
  </v-list-item>
  <v-list-item v-for="(filterBoolean, $key) in filtersBoolean" v-show="props.isVisible" :key="$key">
    <v-row class="row-range">
      <v-col cols="6" :class="{ 'text-grey': filtersActivated[filterBoolean] }">
        {{ $t(filterBoolean) }}
      </v-col>
      <v-col cols="6" class="d-flex justify-space-between align-center">
        <v-switch
          v-model="filters[filterBoolean]"
          :indeterminate="filters[filterBoolean] === undefined"
          density="compact"
          color="primary"
          label="on"
          @update:model-value="() => setFilters(filters)" 
        >
        <template #label>
          <span v-if="filters[filterBoolean] === undefined">
            {{ $t('indeterminate') }}
          </span>
          <span v-else>{{ filters[filterBoolean] ? $t('with') : $t('without') }}</span>
        </template>
      </v-switch>
        <v-btn :icon="mdiClose" size="x-small" @click="filters[filterBoolean] = undefined"></v-btn>
      </v-col>
    </v-row>
  </v-list-item>
</template>

<style lang="scss">
.row-range {
  min-height: 91px; // for the thumb-label
  padding-right: 12px; // for the thumb-label
}
</style>
