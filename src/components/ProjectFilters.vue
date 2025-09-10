<script setup lang="ts">
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDisplay } from 'vuetify'
import { useFiltersStore, stepsHash, valuesHash, newFilter } from '@/stores/filters'
import { storeToRefs } from 'pinia'
import { useUiStore } from '@/stores/ui'

import type { Project, ProjectKey, ProjectLang } from '@/types/Project'
import type { BooleanFilterKey, FilterKey, RangeFilterKey, SelectFilterKey } from '@/types/Filter'
import { mdiChevronLeft, mdiChevronRight, mdiFilterRemoveOutline } from '@mdi/js'
import { defaultAppHeaderHeight } from '@/utils/default'
import keys from '@/assets/data/keys.json'
import data from '@/assets/data/data.json'

const { t, locale } = useI18n({ useScope: 'global' })
const { mobile, width } = useDisplay()

const uiStore = useUiStore()
const { drawerRail } = storeToRefs(uiStore)
const { setDrawerRail } = uiStore

interface FilterSelectValues {
  key: SelectFilterKey
  cols: number
  values: (string | OptionValues)[]
}

const projects = data as Project[]
interface OptionValues {
  title: string
  value: string
}
function getSelectValues(key: ProjectKey): OptionValues[] {
  const projectValues = projects.map((project: Project) => project[key])
  const isString = (value: unknown): value is string => typeof value === 'string'
  const isArray = (value: unknown): value is string[] => Array.isArray(value)
  const uniqueValuesString: string[] = Array.from(new Set(projectValues)).filter(isString)
  const uniqueValuesStringArray: string[] = Array.from(
    new Set(Array.from(new Set(projectValues)).filter(isArray).flat())
  )

  let uniqueValues: string[] = []
  if (uniqueValuesStringArray.length > 0) {
    uniqueValues = uniqueValuesStringArray
  }
  if (uniqueValuesString.length > 0) {
    uniqueValues = uniqueValuesString
  }
  return uniqueValues
    .map((uniqueValue: string) => ({
      title: key.includes('country') ? t('countryFn', [uniqueValue]) : (t(uniqueValue) as string),
      value: uniqueValue as string
    }))
    .sort((a, b) => {
      // Sort by title, case-insensitive
      return a.title.localeCompare(b.title, locale.value, { sensitivity: 'base' })
    })
}

const filterSelectKeys: SelectFilterKey[] = keys
  .filter((x) => x.Filtres === 'oui')
  .map((x) => x.key as SelectFilterKey)

const filtersSelect = computed<FilterSelectValues[]>(() =>
  filterSelectKeys.map((key: SelectFilterKey) => ({
    // example: { key: 'main_concrete_type', values: ['PC', 'CIP'] },
    key,
    cols: key.includes('element_type') ? 12 : 12,
    values: getSelectValues(key)
  }))
)

interface FilterRangeValues {
  key: RangeFilterKey
  values: number[]
  step?: number
}

function getRangeValues(key: FilterKey): number[] {
  const projectValues = projects.map((project: Project) => {
    if (key === 'name') {
      return project[`name_${locale.value as ProjectLang}`]
    }
    return project[key]
  })
  const uniqueValues: number[] = Array.from(new Set(projectValues)).filter(
    (value) => typeof value === 'number'
  ) as number[]
  // [0, 100]
  return [Math.min(...uniqueValues), Math.max(...uniqueValues)]
}

const filtersRangeKeys: RangeFilterKey[] = keys
  .filter((x) => x.Filtres === 'range')
  .map((x) => x.key as RangeFilterKey)

const filtersRange: FilterRangeValues[] = filtersRangeKeys.map((key: RangeFilterKey) => ({
  // example: { key: 'distance_km', values: [0, 100] },
  key,
  values: valuesHash?.[key] ?? getRangeValues(key),
  step: stepsHash?.[key] ?? 1
}))

const filtersBoolean: BooleanFilterKey[] = keys
  .filter((x) => x.Filtres === 'with/without')
  .map((x) => x.key as BooleanFilterKey)

const store = useFiltersStore()
const { filters } = storeToRefs(store)
const { setFilters, resetFilter } = store

const defaultFilter = newFilter()

type FilterActivated = Record<FilterKey, boolean>

const filtersActivated = computed<FilterActivated>(() => {
  return (Object.keys(defaultFilter) as FilterKey[]).reduce(
    (acc: FilterActivated, key: FilterKey) => {
      if (filters.value[key] == undefined) {
        acc[key] = true
        return acc
      }
      if (Array.isArray(filters.value[key])) {
        acc[key] = JSON.stringify(filters.value[key]) === JSON.stringify(defaultFilter[key])
        return acc
      }
      if (typeof filters.value[key] === 'boolean') {
        acc[key] = filters.value[key] === defaultFilter[key]
        return acc
      }
      acc[key] = filters.value[key] === defaultFilter[key]

      return acc
    },
    {} as FilterActivated
  )
})

const drawerStyle = computed(() => {
  // if < 400px mobile, use 100vw, otherwise use max(450px, 25vw)
  return {
    width: mobile.value
      ? !drawerRail.value
        ? width.value < 450
          ? '100vw'
          : '300px'
        : '64px'
      : !drawerRail.value
        ? 'max(450px,25vw)'
        : '64px',
    height: `calc(100vh - ${defaultAppHeaderHeight})`,
    top: defaultAppHeaderHeight,
    zIndex: mobile.value ? 1200 : 1000
  }
})

watch(
  filters,
  (newVal) => {
    setFilters(newVal)
  },
  {
    deep: true
  }
)
</script>

<template>
  <v-navigation-drawer
    :rail="drawerRail"
    permanent
    :style="drawerStyle"
    class="permanent-drawer"
    @click="setDrawerRail(false)"
  >
    <v-list
      density="compact"
      nav
      :class="{ 'hide-all-but-first': drawerRail, 'sticky-header': !drawerRail }"
    >
      <v-list-item class="sticky-header" :append-icon="mdiChevronLeft">
        <v-list-item-title
          class="d-flex ga-2 align-center"
          :class="{ 'drawer-collapsed': drawerRail }"
        >
          <span class="filter-text" :class="mobile ? 'text-subtitle-1' : 'text-h6'">{{
            $t('filters')
          }}</span>
          <v-tooltip :text="$t('clear-filters')" bottom>
            <template #activator="{ props }">
              <v-btn
                class="filter-text"
                v-bind="props"
                :icon="mdiFilterRemoveOutline"
                size="smaller"
                @click="resetFilter"
              />
            </template>
          </v-tooltip>
        </v-list-item-title>
        <template v-if="drawerRail" #prepend>
          <v-tooltip :text="$t('open-filters')" bottom>
            <template #activator="{ props }">
              <v-btn
                :icon="mdiChevronRight"
                v-bind="props"
                variant="flat"
                size="smaller"
                @click.stop="setDrawerRail(false)"
              />
            </template>
          </v-tooltip>
        </template>
        <template v-if="!drawerRail" #append>
          <v-tooltip :text="$t('close-filters')" bottom>
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                :icon="mdiChevronLeft"
                variant="flat"
                size="smaller"
                @click.stop="setDrawerRail(true)"
              />
            </template>
          </v-tooltip>
        </template>
      </v-list-item>
      <v-list-item>
        <v-row>
          <!-- <v-col cols="6" :class="{ 'text-grey': filtersActivated.name }">
              {{ $t('search') }}
            </v-col> -->
          <v-col cols="12">
            <v-text-field
              v-model="filters.name"
              density="compact"
              :clearable="true"
              :label="$t('search')"
            />
          </v-col>
        </v-row>
      </v-list-item>
      <v-list-item>
        <v-row class="filters">
          <template v-for="(filterSelect, $key) in filtersSelect" :key="$key">
            <v-col :cols="filterSelect.cols" :keys="$key">
              <v-select
                v-model="filters[filterSelect.key]"
                :clearable="true"
                :label="$t(filterSelect.key)"
                multiple
                density="compact"
                :clear-icon="mdiFilterRemoveOutline"
                chips
                :items="filterSelect.values"
                @update:model-value="() => setFilters(filters)"
              />
            </v-col>
          </template>
        </v-row>
      </v-list-item>
      <v-list-item v-for="(filterRange, $key) in filtersRange" :key="$key">
        <v-row class="row-range">
          <v-col cols="6" :class="{ 'text-grey': filtersActivated[filterRange.key] }">
            {{ $t(filterRange.key) }}
          </v-col>
          <v-col class="d-flex align-end">
            <v-range-slider
              v-model="filters[filterRange.key]"
              :thumb-label="!filtersActivated[filterRange.key] ? 'always' : undefined"
              density="compact"
              :step="filterRange.step"
              :min="filterRange.values[0]"
              :max="filterRange.values[1]"
            />
          </v-col>
        </v-row>
      </v-list-item>
      <v-list-item v-for="(filterBoolean, $key) in filtersBoolean" :key="$key">
        <v-row class="filters-boolean">
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
            <v-btn
              :icon="mdiFilterRemoveOutline"
              size="x-small"
              @click="filters[filterBoolean] = undefined"
            ></v-btn>
          </v-col>
        </v-row>
      </v-list-item>
    </v-list>
    <!-- <v-sheet v-if="!drawerRail" class="pa-0">
      <BarProjectEchart :projects="data" />
    </v-sheet> -->
  </v-navigation-drawer>
</template>

<style scoped lang="scss">
:root {
  --v-layout-left: 25vw;
  --v-layout-top: 10vh;
}
.v-row.filters > .v-col {
  padding: 4px;
}
.filter-text {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.drawer-collapsed .filter-text {
  opacity: 0;
  transform: translateX(-20px);
}

.row-range {
  min-height: 91px; // for the thumb-label
  padding-right: 12px; // for the thumb-label
}

.v-navigation-drawer {
  border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)) !important;
}

.permanent-drawer {
  :deep(.v-list-item) {
    padding: 0 !important;
  }

  :deep(.v-navigation-drawer__content) {
    z-index: 1000;
    display: grid;
    grid-template-rows: auto;
    grid-gap: 1rem;

    .hide-all-but-first {
      > .v-list-item:not(:first-child) {
        display: none;
      }
    }

    .v-list {
      overflow: auto;
      padding-top: 0 !important;
      padding-left: 1.25rem !important;
      @media screen and (min-width: 1900px) {
        padding: 2.5rem !important;
      }
    }
  }
}

.permanent-drawer.v-navigation-drawer--rail {
  :deep(.v-list) {
    padding: 1.25rem !important;
    overflow-x: hidden;
  }
}

.sticky-header {
  position: sticky;
  top: 0;
  z-index: 1100;
  background: inherit; // or a defined background color if needed
  background-color: #fff;
}
</style>
