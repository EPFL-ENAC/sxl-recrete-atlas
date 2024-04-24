<script setup lang="ts">
import { mdiMapLegend } from '@mdi/js'
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDisplay } from 'vuetify'
import { useFiltersStore } from '@/stores/filters';
import { storeToRefs } from 'pinia';

const { t, locale } = useI18n({ useScope: 'global' })
const { mobile } = useDisplay()

const filtersSelect = [
  { key: 'main_concrete_type', values: ['PC', 'CIP'] },
  { key: 'receiver_location_country', values: ['DE', 'SE', 'FR', 'IT'] },
  { key: 'source_use', values: ['Bridge', 'Building', 'Tunnel', 'Other'] },
  { key: 'source_element_type', values: ['Beam', 'Column', 'Slab', 'Wall'] },
  { key: 'receiver_use_type', values: ['Bridge', 'Building', 'Tunnel', 'Other'] },
  { key: 'receiver_element_type', values: ['Beam', 'Column', 'Slab', 'Wall'] }
]

const filtersRange = [
  { key: 'distance_km', values: [0, 100] },
  { key: 'precs_start_date_year', values: [0, 100] },
  { key: 'component_age_at_start_date', values: [0, 100] },
  { key: 'source_nb_floor', values: [0, 100] },
  { key: 'receiver_nb_floor', values: [0, 100] },
]

const main_concrete_type = ref<any>({
  PC: 'Precast',
  CIP: 'Cast in place'
})

const store = useFiltersStore()
const { filters } = storeToRefs(store)
const { setFilters } = store

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
    <v-list-item-title v-show="props.isVisible">
      <span :class="mobile ? 'text-subtitle-1' : 'text-h6'">{{ $t('filters') }}</span>
    </v-list-item-title>
  </v-list-item>
  <v-list-item v-show="props.isVisible">
    <v-row>
      <v-col cols="6">
        {{ $t('search') }}
      </v-col>
      <v-col cols="6">
        <v-text-field v-model:model-value="filters.name" @update:model-value="() => setFilters(filters)"
          :clearable="true" />
      </v-col>
    </v-row>
  </v-list-item>
  <v-list-item v-for="(filter, $key) in filtersSelect" :key="$key" v-show="props.isVisible">
    <v-row>
      <v-col cols="6">
        {{ $t(`project_${filter.key}`) }}
      </v-col>
      <v-col cols="6">
        <v-select v-model="filters[filter.key]" @update:model-value="() => setFilters(filters)" :clearable="true"
          multiple chips :items="filter.values" />
      </v-col>
    </v-row>
  </v-list-item>
  <v-list-item v-for="(filter, $key) in filtersRange" :key="$key" v-show="props.isVisible">
    <v-row>
      <v-col cols="6">
        {{ $t(`project_${filter.key}`) }}
      </v-col>
      <v-col cols="6">
        <v-range-slider v-model="filters[filter.key]" @update:model-value="() => setFilters(filters)" clearable multiple
          chips :items="filter.values" />
      </v-col>
    </v-row>
  </v-list-item>
</template>

<style lang="scss"></style>
