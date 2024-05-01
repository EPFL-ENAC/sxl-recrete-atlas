/* eslint-disable no-debugger */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ProjectKey, Project } from '@/types/Project'
import data from '@/assets/data/data.json'
import { useFiltersStore } from './filters'
import { storeToRefs } from 'pinia'

export interface Filters extends Record<ProjectKey, string|null|undefined|boolean> {
}

export const useProjectsStore = defineStore('projects', () => {

  const { filters, getFilters } = storeToRefs(useFiltersStore());

  const projects = computed({
    get: () => {
      const filterKeys = Object.keys(filters.value) as ProjectKey[]
      return (data as Project[]).filter((project: Project) => {
        return filterKeys.every((key: ProjectKey) => {
          // debugger;
          // console.log(key, filters.value[key])
          // return true;
          const filterValue = filters.value[key]
          const projectValue = project[key]
          // if (filterValue === undefined) return true
          // if (filterValue === null) return false
          // if (filterValue === '') return true
          // if (typeof filterValue === 'number' && typeof projectValue === 'number')
          //   return projectValue >= filterValue
          // if (Array.isArray(filterValue))
          //   return filterValue?.length === 0 || filterValue.includes(projectValue)
          // debugger;
          if (filterValue === null || filterValue === undefined) return true
          if (typeof filterValue === 'string' && typeof projectValue === 'string') {
            return projectValue.toLowerCase().replace(/[\W_]+/g,"").includes(filterValue.toLowerCase().replace(/[\W_]+/g,""))
          }
          return false;
        })
      })
    },
    set: () => {}
  })


  return { projects }
})
