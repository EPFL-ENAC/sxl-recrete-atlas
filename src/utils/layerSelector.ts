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
