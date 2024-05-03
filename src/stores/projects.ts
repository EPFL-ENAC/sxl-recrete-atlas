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
          const filterValue = (filters as any).value[key as ProjectKey]
          const projectValue = project[key]
          if (typeof filterValue === 'string' && typeof projectValue === 'string') {
            // name filter
            return projectValue.toLowerCase().replace(/[\W_]+/g,"").includes(filterValue.toLowerCase().replace(/[\W_]+/g,""))
          }
          if (Array.isArray(filterValue) && typeof projectValue === 'string') {
            // select filter
            // return true;
            return filterValue.length === 0 || filterValue.includes(projectValue)
          }
          if (Array.isArray(filterValue) && filterValue.length == 2 && typeof projectValue === 'number') {
            // range filter
            return true;
            // return filterValue[0] <= projectValue && projectValue <= filterValue[1]
          }
          
          // if (typeof filterValue === 'boolean') {
          //   // boolean filter
          //   return true;
          //   // return filterValue
          // }
          // if (projectValue === undefined || projectValue === null) {
          //   // debugger;
          //   return true;
          // }
          // if (filterValue === null || filterValue === undefined) {
          //   // debugger;
          //   return true;
          // }
          // debugger;
          return true;
        })
      })
    },
    set: () => {}
  })


  return { projects }
})
