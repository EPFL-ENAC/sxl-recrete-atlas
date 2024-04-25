export interface Project {
  _id: number;
  description: string;
  name: string;
  main_concrete_type: string;
  main_concrete_type_uncertainty: string;
  receiver_location_coordinates: string;
  receiver_location_country: string;
  receiver_location_city: string;
  distance_km: number;
  precs_start_date_year: number;
  component_age_at_start_date: number;
  quantity_reclaimed_ton: string;
  source_nb_floor: string;
  source_use: string;
  source_element_type: string;
  receiver_nb_floor: number;
  receiver_use_type: string;
  receiver_element_type: string;
  design_solution_status: string;
  reference: string;
  impact_design_alternative: string;
  impact_difference: string;
  impact_source: string;
  cost_design_alternative: string;
  cost_difference_min_percent: number;
  cost_difference_max_percent: number;
  cost_source: string;
  images?: string[];
}

export type ProjectKey = keyof Project;