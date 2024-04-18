<script setup lang="ts">
import {  ref } from 'vue'
import {  mdiChevronRight,mdiChevronLeft} from '@mdi/js'
import { useDisplay } from 'vuetify'
import { useI18n } from 'vue-i18n'
import projects from "@/assets/data.json";
import ProjectFilters from '@/components/ProjectFilters.vue';


const { t, locale } = useI18n({ useScope: 'global' })
const { mobile } = useDisplay()

const data = ref<any>(false)
const drawerRail = ref(false)

data.value = projects
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
  <v-container class="fill-height pa-0" fluid>
    <v-row class="fill-height">
      <v-col cols="12" class="py-0">
        <v-col :key="$key" v-for="(item, $key) in data">
      
      <v-card>
        <v-card-title>
          {{ item.name }}
        </v-card-title>
        <v-card-text>
          {{ item.description }}
          </v-card-text>

      </v-card>
      </v-col>
      </v-col>
      </v-row>
  </v-container>
</template>
