/* eslint-disable no-debugger */
import { defineStore } from 'pinia'
import { computed, reactive, ref } from 'vue'
// import type { ProjectKey } from '@/types/Project'
import type { Filter, FilterKey, RangeFilterKey } from '@/types/Filter'
// import keys from '@/assets/data/keys.json'

// export type Filters = Record<ProjectKey, string | null | undefined | boolean | readonly (string | number)[]>;

// for reactiveness we need all the fields to be ref
function newFilter(): Filter {
  return {
    main_concrete_type: [],
    receiver_country: [],
    donor_use: [],
    donor_element_type: [],
    receiver_use: [],
    receiver_element_type: [],
    distance_km: [0, 600],
    start_date_year: [1960, 2021],
    component_age: [0, 100],
    donor_nb_floor: [0, 100],
    receiver_nb_floor: [0, 100],
    impact_difference: false,
    cost_difference_min_percent: false,
    name: ""
  }
}

export const useFiltersStore = defineStore('filters', () => {
  function valueToLocalStorage(value: any): void{
    localStorage.setItem("pinia_filters", JSON.stringify(value));
  }
  function localStorageToValue(): any {
    const pinia_filters = localStorage.getItem("pinia_filters")
    return pinia_filters ? JSON.parse(pinia_filters) : newFilter()
  }

  const filters = ref<Filter>(localStorageToValue())

  const getFilters = computed(() => {
    filters.value = localStorageToValue()
    return filters
  })

  function setFilters(newFilters: Filter) {
    (Object.keys(newFilters) as FilterKey[]).forEach((key: FilterKey) => {
      (filters.value as Filter)[key] = newFilters[key] as never;
    })
    valueToLocalStorage(filters.value)
  }

  function setRangeFilters(value: number[], key: RangeFilterKey) {
    filters.value[key] = value;
    setFilters({
      ...filters.value,
      [key]: value
    })
  }

  function resetFilter(): void {
    setFilters(newFilter());
  }
  

  return { filters, setFilters, setRangeFilters, getFilters, resetFilter }
})
