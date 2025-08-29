/* eslint-disable no-debugger */
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Project, ProjectLang, ProjectKey } from '@/types/Project'
import data from '@/assets/data/data.json'
import { useFiltersStore } from './filters'
import { storeToRefs } from 'pinia'
import { newFilter } from '@/stores/filters'
import type { Filter, FilterKey } from '@/types/Filter'
import { useI18n } from 'vue-i18n'

export type FilterValue = string | null | undefined | boolean
export type Filters = Record<ProjectKey, FilterValue>

function randomOffset(): [number, number] {
  const radius = 4 // 1 km
  const distance = Math.random() * radius
  const angle = Math.random() * 2 * Math.PI
  const offsetX = distance * Math.cos(angle)
  const offsetY = distance * Math.sin(angle)
  return [offsetX, offsetY]
}

export const useProjectsStore = defineStore('projects', () => {
  const { locale } = useI18n({ useScope: 'global' })
  const { filters } = storeToRefs(useFiltersStore())

  // Basic projects filtering as before.
  const filteredProjects = computed(() => {
    const filterKeys = Object.keys(filters.value) as ProjectKey[]
    const defaultFilter: Filter = newFilter()
    return (data as Project[]).filter((project: Project) => {
      return filterKeys.every((key: ProjectKey | FilterKey) => {
        const filterValue: FilterValue = filters.value[key as FilterKey] as FilterValue

        // If filterValue is empty or undefined, skip filtering on this key
        if (
          filterValue === undefined ||
          filterValue === null ||
          (typeof filterValue === 'string' && filterValue.trim() === '') ||
          (Array.isArray(filterValue) && filterValue.length === 0)
        ) {
          return true
        }

        let projectValue = project[key as ProjectKey]
        if (key === 'name') {
          const projectName: string =
            project[`${key}_${locale.value as ProjectLang}` as 'name_en' | 'name_fr']
          projectValue = projectName?.toLowerCase().replace(/[\W_]+/g, '')
        }
        if (typeof filterValue === 'string' && typeof projectValue === 'string') {
          return projectValue.includes(filterValue.toLowerCase().replace(/[\W_]+/g, ''))
        }
        if (
          Array.isArray(filterValue) &&
          (typeof projectValue === 'string' || projectValue === undefined)
        ) {
          // select filter mainly
          // range filter here if defaultFilterValue.length === 2 // it works though..
          const defaultFilterValue = defaultFilter[key as FilterKey] ?? []
          if (JSON.stringify(filterValue) === JSON.stringify(defaultFilterValue)) {
            return true
          }
          return projectValue !== undefined && filterValue.includes(projectValue)
        }

        if (
          Array.isArray(filterValue) &&
          Array.isArray(projectValue) &&
          projectValue.length > 0 &&
          typeof projectValue[0] === 'string'
        ) {
          // select filter for array and array
          return (
            projectValue !== undefined &&
            filterValue.some((value: string) => (projectValue as string[]).includes(value))
          )
        }

        if (Array.isArray(filterValue) && filterValue.length === 2) {
          // range filterq
          const defaultFilterValue = defaultFilter[key as FilterKey] ?? []
          if (JSON.stringify(filterValue) === JSON.stringify(defaultFilterValue)) {
            return true
          }
          if (typeof projectValue === 'number') {
            return filterValue[0] <= projectValue && projectValue <= filterValue[1]
          } else {
            // should probably check if the filterValue === defaultFilterValue ?
            // if that's the case return true ?
            // until then, we must return true, to avoid filtering out the project with undefined value
            return true
          }
        }

        if (typeof filterValue === 'boolean') {
          // boolean filter
          if (projectValue !== undefined) {
            return filterValue
          } else {
            return !filterValue
          }
        }
        if (projectValue === undefined || projectValue === null) {
          return true
        }
        if (filterValue === null || filterValue === undefined) {
          return true
        }
        return true
      })
    })
    .sort((a: Project, b: Project) => {
      return b.start_date_year - a.start_date_year;
    });
  })

  // Precompute offsets outside of any computed that causes side effects.
  const projectOffsets = ref<Record<string, [number, number]>>({})
  const projectsWithOffsets = computed(() => {
    return filteredProjects.value.map((project: Project) => {
      // Use the unique project ID as key
      const key = project._id
      if (!projectOffsets.value[key]) {
        projectOffsets.value[key] = randomOffset()
      }
      return { ...project, offset: projectOffsets.value[key] }
    })
  })

  const countries = computed(() =>
    (data as Project[])
      .map((project: Project) => project.receiver_country)
      .filter((value, index, self) => self.indexOf(value) === index)
  )

  return { projects: projectsWithOffsets, countries }
})
