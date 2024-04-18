<script setup lang="ts">
import { mdiMapLegend } from '@mdi/js'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDisplay } from 'vuetify'

const { t, locale } = useI18n({ useScope: 'global' })
const { mobile } = useDisplay()

const filters = [
  { key: 'main_concrete_type', values: ['PC', 'CIP'] },
  { key: 'receiver_location_country', values: ['DE', 'SE', 'FR', 'IT'] },
  { key: 'source_use', values: ['Bridge', 'Building', 'Tunnel', 'Other'] },
  { key: 'source_element_type', values: ['Beam', 'Column', 'Slab', 'Wall'] },
  { key: 'receiver_use_type', values: ['Bridge', 'Building', 'Tunnel', 'Other'] },
  { key: 'receiver_element_type', values: ['Beam', 'Column', 'Slab', 'Wall'] }
]

const main_concrete_type = ref<any>({
  PC: "Precast",
  CIP: "Cast in place",
})

let filtersSelected = ref<any>({})
</script>

<template>
  <v-list-item :prepend-icon="mdiMapLegend">
    <v-list-item-title>
      <span :class="mobile ? 'text-subtitle-1' : 'text-h6'">{{ $t('filters') }}</span>
    </v-list-item-title>
  </v-list-item>
  <v-list-item v-for="(filter, $key) in filters" :key="$key">
    <v-row>
      <v-col cols="6">
        {{ $t(`project_${filter.key}`) }}
      </v-col>
      <v-col cols="6">
        <v-select
          v-model:focused="filtersSelected[filter.key]"
          clearable
          multiple
          chips
          :items="filter.values"
        />
      </v-col>
    </v-row>
  </v-list-item>
</template>

<style lang="scss"></style>
