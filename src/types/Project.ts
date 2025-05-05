export type ProjectLang = 'fr' | 'en'
export interface Project {
  _id: number
  offset: [number, number]
  description_fr: string
  description_en: string
  name_fr: string
  name_en: string
  main_concrete_type: string[]
  main_concrete_type_uncertainty?: number[]
  receiver_country: string
  receiver_city: string
  receiver_coordinates?: number[]
  location_uncertainty?: number
  distance_km: number
  distance_smaller?: number
  distance_uncertainty?: number
  start_date_year: number
  date_uncertainty?: string
  component_age?: number
  age_smaller?: number
  age_uncertainty?: number
  quantity_reclaimed?: number
  quantity_reclaimed_unit?: string
  donor_nb_floor?: number
  donor_nb_floor_smaller?: number
  donor_use?: string[]
  donor_element_type?: string[]
  receiver_nb_floor?: number
  receiver_nb_floor_smaller?: number
  receiver_nb_floor_uncertainty?: number
  receiver_use?: string[]
  receiver_element_type?: string[]
  reference?: string[]
  impact_design_alternative?: string
  impact_difference?: string
  impact_unit?: string
  impact_source?: string
  cost_design_alternative?: string
  cost_difference_min_percent?: string
  cost_difference_max_percent?: string
  cost_source?: string
  images?: string[]
  images_credits?: string[]
  status?: string
  actors?: string[]
  other?: string
}

export type ProjectKey = keyof Project
