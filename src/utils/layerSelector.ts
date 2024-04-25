export type SelectableItem = SelectableSingleItem | SelectableGroupItem
export interface SelectableParentItem {
  label: string
  selected?: boolean
}

export interface ScaleEntry {
  color: string
  label: string
  min?: number
  max?: number
  unit?: string
}

export interface SelectableSingleItem extends SelectableParentItem {
  id: string
  ids: string[]
  genre: string
  label_en: string
  label_fr: string
  legend?: string
  legendImage?: string
  legendScaleId?: string,
  measures: string[]
}
export interface SelectableGroupItem extends SelectableParentItem {
  id: string
  tab: boolean
  children: SelectableSingleItem[]
}

// from the csv
export interface SpeciesItem {
  GENRE_lat: string
  GENRE_fr: string
  GENRE_en: string
  GENRE_eng: string
  'GENUS TREE COUNT': number
  'GENUS SHARE': string
  NOM_COMPLET_lat: string
  NOM_COMPLET_fr: string
  NOM_COMPLET_en: string
  NOM_COMPLET_eng: string
  'SPECIE TREE COUNT': number
  'SPECIE SHARE': string
  sum_BVOC_kg: number
  mean_BVOC_kg: number
  sum_O3_kg: number
  mean_O3_kg: number
  sum_OFP_kg: number
  mean_OFP_kg: number
  sum_PM10_kg: number
  mean_PM10_kg: number
  Net_O3: number
  // derived properties
  id: string
  genus: string
  measures: string[]
}

// from geojson
export interface SpeciesProps {
  GENRE_lat: string
  GENRE_fr: string
  GENRE_eng: string
  NOM_COMPLET_lat: string
  NOM_COMPLET_fr: string
  NOM_COMPLET_eng: string
  COMMUNE: string
  REMARQUABL: string
  SITUATION: string
  TYPE_PLANT: string
  NOMBRE_TRO: string
  DIAMETRE_1: number
  CIRCONFERE: number
  HAUTEUR_TR: number
  HAUTEUR_TO: number
  DIAMETRE_C: number
  FORME: string
  STADE_DEVE: string
  VITALITE: string
  CONDUITE: string
  TYPE_SOL: string
  TYPE_SURFA: string
  ESPERANCE_: number
  DATE_PLANT: string
  DATE_PLA_1: number
  DATE_OBSER: string
  ID_ACTEUR: string
  CLASSE: string
  RAYON_COUR: number
  SOUCHE: string
  STATUT: string
  ID_ARBRE: number
  NO_INVENTA: string
  D_COUR_M: number
  leaf: string
  gmax: number
  O3_rm_gy: number
  L_area: number
  L_biomass: number
  ISO_gh: number
  MONO_gh: number
  SQT_gh: number
  VOC_tot: number
  VOC_g_y: number
  OFP_kg_y: number
  PM10_rm_gy: number,
  color_voc: string,
  color_pm10: string,
  color_ofp: string,
  color_o3: string
}