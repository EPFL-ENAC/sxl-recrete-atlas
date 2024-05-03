<script setup lang="ts">
import ProjectCard from '@/components/ProjectCard.vue'
import ProjectDialog from '@/components/ProjectDialog.vue'
import ProjectFilters from '@/components/ProjectFilters.vue'
import { useProjectsStore } from '@/stores/projects'
import { mdiChevronLeft, mdiChevronRight } from '@mdi/js'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import keys from '@/assets/data/keys.json'

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

const projects = storeToRefs(useProjectsStore()).projects

const data = projects
const drawerRail = ref(false)

const isProjectDialogOpen = ref(false)
const projectSelected = ref<any>(false)

const selectProject = (project: any) => {
  projectSelected.value = project
  isProjectDialogOpen.value = true
}

const onRowClicked = (ref: any, row: any) => {
  selectProject(row.item)
}

const headers = keys.filter(x => x["List View"] === 'oui').map(x => ({
  title: t(x.key),
  value: x.key as string,
  sortable: false
}))
// const headers = [
//   { title: t('project__id'), value: '_id', sortable: false },
//   // { title: t("project_description"), value: "description", sortable: false},
//   { title: t('project_name'), value: 'name', sortable: false },
//   { title: t('project_main_concrete_type'), value: 'main_concrete_type', sortable: false },
//   // { title: t("project_main_concrete_type_uncertainty"), value: "main_concrete_type_uncertainty", sortable: false},
//   // { title: t("project_receiver_location_coordinates"), value: "receiver_location_coordinates", sortable: false},
//   {
//     title: t('project_receiver_location_country'),
//     value: 'receiver_location_country',
//     sortable: false
//   },
//   { title: t('project_distance_km'), value: 'distance_km', sortable: false },
//   { title: t('project_receiver_city'), value: 'receiver_city', sortable: false },
//   { title: t('project_start_date_year'), value: 'start_date_year', sortable: false }
//   // { title: t("project_component_age_at_start_date"), value: "component_age_at_start_date", sortable: false},
//   // { title: t("project_quantity_reclaimed_ton"), value: "quantity_reclaimed_ton", sortable: false},
//   // { title: t("project_source_nb_floor"), value: "source_nb_floor", sortable: false},
//   // { title: t("project_source_use"), value: "source_use", sortable: false},
//   // { title: t("project_source_element_type"), value: "source_element_type", sortable: false},
//   // { title: t("project_receiver_nb_floor"), value: "receiver_nb_floor", sortable: false},
//   // { title: t("project_receiver_use_type"), value: "receiver_use_type", sortable: false},
//   // { title: t("project_receiver_element_type"), value: "receiver_element_type", sortable: false},
//   // { title: t("project_design_solution_status"), value: "design_solution_status", sortable: false},
//   // { title: t("project_reference"), value: "reference", sortable: false},
//   // { title: t("project_impact_design_alternative"), value: "impact_design_alternative", sortable: false},
//   // { title: t("project_impact_difference"), value: "impact_difference", sortable: false},
//   // { title: t("project_impact_source"), value: "impact_source", sortable: false},
//   // { title: t("project_cost_design_alternative"), value: "cost_design_alternative", sortable: false},
//   // { title: t("project_cost_difference_min_percent"), value: "cost_difference_min_percent", sortable: false},
//   // { title: t("project_cost_difference_max_percent"), value: "cost_difference_max_percent", sortable: false},
//   // { title: t("project_cost_source"), value: "cost_source", sortable: false},
// ]
</script>

<template>
  <v-navigation-drawer
    :rail="drawerRail"
    permanent
    :width="mobile ? 300 : 450"
    @click="drawerRail = false"
  >
    <v-list density="compact" nav>
      <v-list-item :prepend-icon="drawerRail ? mdiChevronRight : undefined">
        <template #append>
          <v-btn :icon="mdiChevronLeft" variant="flat" @click.stop="drawerRail = true" />
        </template>
      </v-list-item>
      <project-filters :is-visible="!drawerRail" />
    </v-list>
  </v-navigation-drawer>
  <v-container v-if="listMode === 'list'" class="fill-height pa-0 align-baseline" fluid>
    <v-data-table
      :items="data"
      :headers="headers"
      :items-per-page="data.length"
      @click:row="onRowClicked"
    >
      <template v-slot:bottom> </template>
    </v-data-table>
  </v-container>
  <v-container v-if="listMode === 'grid'" class="fill-height pa-0 grid-list" fluid>
    <project-card
      v-for="(item, $key) in data"
      :key="$key"
      :item="item"
      @click="() => selectProject(item)"
    />
  </v-container>
  <project-dialog v-model="isProjectDialogOpen" :project="projectSelected" />
</template>

<style scoped lang="scss">
.grid-list {
  --card-size: 400px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(var(--card-size), 1fr));
  grid-template-rows: repeat(auto-fill, minmax(var(--card-size), var(--card-size)));
  gap: 1rem;
}
</style>
