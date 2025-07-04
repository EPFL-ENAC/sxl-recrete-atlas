export interface TextFilter {
  name: string | null
}
export type TextFilterKey = keyof TextFilter
export interface SelectFilter {
  main_concrete_type: string[]
  receiver_country: string[]
  donor_use: string[]
  donor_element_type: string[]
  receiver_use: string[]
  receiver_element_type: string[]
}
export type SelectFilterKey = keyof SelectFilter

export interface RangeFilter {
  distance_km: number[]
  start_date_year: number[]
  component_age: number[]
  donor_nb_floor: number[]
  receiver_nb_floor: number[]
}
export type RangeFilterKey = keyof RangeFilter

export interface BooleanFilter {
  impact_difference?: boolean
  research_prototype?: boolean
  unbuilt_with_construction_permission?: boolean
  cost_difference_min_percent?: boolean
}
export type BooleanFilterKey = keyof BooleanFilter

export type Filter = SelectFilter & RangeFilter & BooleanFilter & TextFilter

// todo should be extension of Project key somehow
export type FilterKey = keyof Filter
export interface Key {
  key: string
  english: string
  french: string
  'List View': 'oui' | ''
  Filtres: 'oui' | 'with/without' | 'range' | ''
}
