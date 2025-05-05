import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Filter, FilterKey, RangeFilterKey } from '@/types/Filter'

export const stepsHash: Partial<Record<RangeFilterKey, number>> = {
  distance_km: 10
}
const currentYear = parseInt(new Date().toISOString().substring(0, 4), 10)
export const valuesHash: Partial<Record<RangeFilterKey, number[]>> = {
  start_date_year: [1960, currentYear],
  distance_km: [0, 1000]
}

// for reactiveness we need all the fields to be ref
export function newFilter(): Filter {
  return {
    main_concrete_type: [],
    receiver_country: [],
    donor_use: [],
    donor_element_type: [],
    receiver_use: [],
    receiver_element_type: [],
    distance_km: valuesHash.distance_km ?? [0, 1000],
    start_date_year: valuesHash.start_date_year ?? [1960, currentYear],
    component_age: [0, 100],
    donor_nb_floor: [0, 100],
    receiver_nb_floor: [0, 100],
    impact_difference: undefined,
    cost_difference_min_percent: undefined,
    name: null
  }
}

export const useFiltersStore = defineStore('filters', () => {
  function valueToLocalStorage(value: Filter): void {
    localStorage.setItem('pinia_filters', JSON.stringify(value))
  }
  function localStorageToValue(): Filter {
    const pinia_filters = localStorage.getItem('pinia_filters')
    return pinia_filters ? JSON.parse(pinia_filters) : newFilter()
  }

  const filters = ref<Filter>(localStorageToValue())

  const getFilters = computed(() => {
    filters.value = localStorageToValue()
    return filters
  })

  function setFilters(newFilters: Filter) {
    ;(Object.keys(newFilters) as FilterKey[]).forEach((key: FilterKey) => {
      ;(filters.value as Filter)[key] = newFilters[key] as never
    })
    valueToLocalStorage(filters.value)
  }

  function setRangeFilters(value: number[], key: RangeFilterKey) {
    filters.value[key] = value
    setFilters({
      ...filters.value,
      [key]: value
    })
  }

  function resetFilter(): void {
    setFilters(newFilter())
  }

  return { filters, setFilters, setRangeFilters, getFilters, resetFilter }
})
