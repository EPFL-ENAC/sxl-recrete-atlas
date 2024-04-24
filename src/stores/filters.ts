/* eslint-disable no-debugger */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ProjectKey } from '@/types/Project'

export interface Filters extends Record<ProjectKey, string|null|undefined|boolean> {
}

export const useFiltersStore = defineStore('filters', () => {
  function valueToLocalStorage(value: any): void{
    localStorage.setItem("pinia_filters", JSON.stringify(value));
  }
  function localStorageToValue(): any {
    const pinia_filters = localStorage.getItem("pinia_filters")
    return pinia_filters ? JSON.parse(pinia_filters) : {}
  }

  const filters = ref<Filters>(localStorageToValue())

  const getFilters = computed(() => {
    filters.value = localStorageToValue()
    return filters.value
  })

  function setFilters(newFilters: any) {
    filters.value = newFilters
    valueToLocalStorage(filters.value)
  }

  return { filters, setFilters, getFilters }
})
