<script setup lang="ts">
import ProjectCard from '@/components/ProjectCard.vue'
import ProjectDialog from '@/components/ProjectDialog.vue'
import ProjectFilters from '@/components/ProjectFilters.vue'
import BarProjectEchart from '@/components/BarProjectEchart.vue'
import ReferenceList from '@/components/ReferenceList.vue'
import { useProjectsStore } from '@/stores/projects'
import { mdiChevronLeft, mdiChevronRight, mdiInformationSlabCircle } from '@mdi/js'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import keys from '@/assets/data/keys.json'
import type { Project, ProjectLang } from '@/types/Project'
import { useRoute } from 'vue-router'
import { defaultAppHeaderHeight } from '@/utils/default'
import type { VDataTable } from 'vuetify/components/VDataTable'
import { Dropdown as VDropdown } from 'floating-vue'

const route = useRoute()
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

const currentRowIndex = ref<number | undefined>(undefined)
const currentRowItem = ref<Project | undefined>(undefined)

const projects = storeToRefs(useProjectsStore()).projects

const data = projects
const drawerRail = ref(false)

const isProjectDialogOpen = ref(route.query?.projectId !== undefined)
const projectSelectedId = ref<number | undefined>(route?.query?.projectId ? parseInt(route.query.projectId as string, 10) : undefined)
const projectSelected = ref<Project | undefined>(projects.value?.find((x: Project) => x._id === projectSelectedId.value))

const selectProject = (project: Project) => {
  projectSelected.value = project
  isProjectDialogOpen.value = true
  projectId.value = String(project._id)
}

const projectId = computed({
  get() {
    return route.query.projectId ?? ''
  },
  set(projectId) {
    router.replace({ query: { ...route.query, projectId } })
  }
})

interface ListViewHeaders {
  title: string
  value: string
  sortable: boolean
}

const headers = computed<ListViewHeaders[]>({
  get() {
    // it works for name_en and name_fr because keys.json has the same translation for both languages
    return keys.filter(x => x["List View"] === 'oui').map(x => ({
      title: t(x.key),
      value: x.key as string,
      sortable: false
    }))
  },
  set() { return void 0 }
});

interface ProjectRow<T> {
  index: number
  item: T
}

const onRowClicked = (ref: unknown, row: ProjectRow<Project>) => {
  selectProject(row.item)
}



const mouseOverRow = (element: unknown, row: ProjectRow<Project>) => {
  if (showRowTooltip.value === false) {
    return
  }
  currentRowIndex.value = row.index;
  currentRowItem.value = row.item;
}
const mouseLeaveRow = () => {
  currentRowIndex.value = undefined;
  currentRowItem.value = undefined;
}
const appHeaderHeight = ref(`${defaultAppHeaderHeight}px`);

const showRowTooltip = ref(true);

</script>

<template>
  <v-navigation-drawer
:rail="drawerRail" permanent :width="mobile ? 300 : 450" class="permanent-drawer"
    @click="drawerRail = false">
    <v-list density="compact" nav>
      <v-list-item :prepend-icon="drawerRail ? mdiChevronRight : undefined">
        <template #append>
          <v-btn :icon="mdiChevronLeft" variant="flat" @click.stop="drawerRail = true" />
        </template>
      </v-list-item>
      <project-filters :is-visible="!drawerRail" />
    </v-list>
    <v-sheet v-if="!drawerRail" class="pa-0">
      <BarProjectEchart :projects="data" />
    </v-sheet>

  </v-navigation-drawer>
  <v-container v-if="listMode === 'list'" class="fill-height pa-0 align-baseline" fluid>
    <v-tooltip
v-if="currentRowIndex !== undefined" :width="500" :open-delay="150" :animate="true" :close-delay="150"
      :activator="`.hovered-${currentRowIndex}`" location="top">
      {{ currentRowItem?.[`description_${locale as ProjectLang}`] }}
    </v-tooltip>
    <v-data-table
class="recrete-list-data-table" :items="data" :headers="headers" :items-per-page="data.length"
      :hover="true" :fixed-header="true" :loading="data.length === 0"
      :row-props="row => ({ class: `hovered-${row.index}` })" @click:row="onRowClicked" @mouseover:row="mouseOverRow"
      @mouseleave:row="mouseLeaveRow">
      <template #[`item.main_concrete_type`]="{ item }">
        <ul class="comma-separated-list">
          <li v-for="(concrete_type, $key) in item.main_concrete_type" :key="$key">{{ $t(concrete_type) }}</li>
        </ul>
      </template>
      <template #[`item.donor_element_type`]="{ item }">
        <ul class="comma-separated-list">
          <li v-for="(el, $key) in item.donor_element_type" :key="$key">{{ $t(el) }}</li>
        </ul>
      </template>
      <template #[`item.receiver_element_type`]="{ item }">
        <ul class="comma-separated-list">
          <li v-for="(el, $key) in item.receiver_element_type" :key="$key">{{ $t(el) }}</li>
        </ul>
      </template>
      <template #[`item.donor_use`]="{ item }">
        <ul class="comma-separated-list">
          <li v-for="(el, $key) in item.donor_use" :key="$key">{{ $t(el) }}</li>
        </ul>
      </template>
      <template #[`item.receiver_use`]="{ item }">
        <ul class="comma-separated-list">
          <li v-for="(el, $key) in item.receiver_use" :key="$key">{{ $t(el) }}</li>
        </ul>
      </template>
      <template #[`item.receiver_country`]="{ item }">
        {{ $t("countryFn", [item.receiver_country]) }}
      </template>
      <template #[`item.name_en`]="{ item }">
        {{ item[`name_${locale as ProjectLang}`] }}
      </template>
      <template #[`item.reference`]="{ item }">
        <VDropdown
:distance="6" popper-class="popper-class" placement="left"
          @click.stop.prevent="">
          <!-- This will be the popover reference (for the events and position) -->
          <button @click.stop.prevent="">
            <v-icon :icon="mdiInformationSlabCircle"></v-icon>
          </button>

          <!-- This will be the content of the popover -->
          <template #popper>
            <ReferenceList :item="item" />
          </template>
        </VDropdown>
      </template>
      <template #bottom />
    </v-data-table>
  </v-container>
  <v-container v-if="listMode === 'grid'" class="pa-0 grid-list" fluid>
    <project-card v-for="(item, $key) in data" :key="$key" :item="item" @click="() => selectProject(item)"
        max-height="100%" min-height="100%" height="100%"/>
  </v-container>
  <project-dialog v-model="isProjectDialogOpen" :project="projectSelected" />
</template>

<style>
.popper-class {
  width: 800px;
  .v-popper__inner {
    padding: 1.5rem;
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
  }
}
</style>
<style scoped lang="scss">

.permanent-drawer {
  :deep(.v-navigation-drawer__content) {
    z-index: 1000;
    display: grid;
    grid-template-rows: auto 100px;
    grid-gap: 1rem;

    .v-list {
      overflow: auto;

    }
  }
}

.grid-list {
  --card-size: 350px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(var(--card-size), 1fr));
  grid-template-rows: repeat(auto-fill, minmax(var(--card-size), var(--card-size)));
  gap: 2rem;
}

.comma-separated-list {
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    display: inline;
  }

  li:not(:last-child)::after {
    content: ", ";
  }
}

.recrete-list-data-table {
  height: calc(100vh - v-bind(appHeaderHeight))
}
</style>
