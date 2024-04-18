<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router';
import { mdiChevronRight, mdiChevronLeft } from '@mdi/js'
import { useDisplay } from 'vuetify'
import { useI18n } from 'vue-i18n'
import projects from "@/assets/data.json";
import ProjectFilters from '@/components/ProjectFilters.vue';


const { t, locale } = useI18n({ useScope: 'global' })
const { mobile } = useDisplay()
const router = useRouter()
const $route = router.currentRoute

const listMode = computed({
  get: () => $route.value.query.view,
  set: (value) => {
    router.push({ query: { ...$route.value.query, view: value } })
  }
})

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
  <v-container class="fill-height pa-0" fluid v-if="listMode === 'list'">
    <v-data-table :items="data"></v-data-table>
  </v-container>
  <v-container class="fill-height pa-0" fluid v-if="listMode === 'grid'">
    <v-row class="fill-height">
      <v-col cols="12" class="py-0">
        <v-card :key="$key" v-for="(item, $key) in data" class="mx-auto" max-width="400">
          <v-img class="align-end text-white" height="200" src="beton.png" cover>
            <v-card-title>{{ item.name }}</v-card-title>
          </v-img>

          <v-card-subtitle class="pt-4">
            {{ item._id }}
          </v-card-subtitle>

          <v-card-text>
            {{ item.description }}
          </v-card-text>

          <v-card-actions>
            <v-btn color="orange" text="Share"></v-btn>

            <v-btn color="orange" text="Explore"></v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
