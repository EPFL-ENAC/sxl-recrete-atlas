<script setup lang="ts">
import {  mdiMapLegend,} from '@mdi/js'
import { useDisplay } from 'vuetify'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n({ useScope: 'global' })
const { mobile } = useDisplay()

</script>

<template>
  <v-list-item :prepend-icon="mdiMapLegend">
    <v-list-item-title>
      <span :class="mobile ? 'text-subtitle-1' : 'text-h6'">{{ $t('filters') }}</span>
    </v-list-item-title>
  </v-list-item>
  <v-list-item >
    <v-row>
      <v-col cols="2">
        
      </v-col>
    </v-row>
  </v-list-item>
</template>

<style lang="scss">
</style>
