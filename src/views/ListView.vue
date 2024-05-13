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
import type { Project } from '@/types/Project'
import { useRoute } from 'vue-router'

const route = useRoute()
const { t } = useI18n({ useScope: 'global' })
const { mobile } = useDisplay()
const router = useRouter()
const $route = router.currentRoute

const listMode = computed({
  get: () => $route.value.query.view,
  set: (value) => {
    router.push({ query: { ...$route.value.query, view: value } })
  }
})

const currentRowIndex= ref<number|undefined>(undefined)
const currentRowItem= ref<Project|undefined>(undefined)

const projects = storeToRefs(useProjectsStore()).projects

const data = projects
const drawerRail = ref(false)

const isProjectDialogOpen = ref(route.query?.projectId !== undefined)
const projectSelectedId = ref<number|undefined>(route?.query?.projectId ? parseInt(route.query.projectId as string, 10) : undefined)
const projectSelected = ref<any>(projects.value?.find((x: any) => x._id === projectSelectedId.value))

const selectProject = (project: any) => {
  projectSelected.value = project
  isProjectDialogOpen.value = true
  projectId.value = project._id
}

const projectId = computed({
  get() {
    return route.query.projectId ?? ''
  },
  set(projectId) {
    router.replace({query: {...route.query, projectId } })
  }
})

const onRowClicked = (ref: any, row: any) => {
  selectProject(row.item)
}

const headers = keys.filter(x => x["List View"] === 'oui').map(x => ({
  title: t(x.key),
  value: x.key as string,
  sortable: false
}))

const mouseOverRow = (element: any, row: any) => {
  currentRowIndex.value = row.index;
  currentRowItem.value = row.item;
}
const mouseLeaveRow = () => {
  currentRowIndex.value = undefined;
  currentRowItem.value = undefined;
}
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

    <v-tooltip
        v-if="currentRowIndex !== undefined"
        :activator="`.hovered-${currentRowIndex}`"
        location="top"
      >
    {{ currentRowItem?.description_en }}
  </v-tooltip>
    <v-data-table
      :items="data"
      :headers="headers"
      :items-per-page="data.length"
      :hover="true"
      :row-props="row => ({ class: `hovered-${row.index}` })"
      @click:row="onRowClicked"
      @mouseover:row="mouseOverRow"
      @mouseleave:row="mouseLeaveRow"

    >
      <template #bottom />
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
