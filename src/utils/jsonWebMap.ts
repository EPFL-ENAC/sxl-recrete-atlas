import type { LngLatLike } from 'maplibre-gl'
import type { SelectableItem } from './layerSelector'

export interface ScaleEntry {
  color: string
  label: string
  value?: number
  min?: number
  max?: number
  unit?: string
  range?: number[]
}

export interface LegendScale {
  id: string
  title?: string
  titleStart?: string
  titleEnd?: string
  unit?: string
  scale: ScaleEntry[]
}

export interface Parameters {
  /**
   * Map default center coordinates
   */
  center?: LngLatLike
  /**
   * Map default zoom level
   */
  zoom?: number
  /**
   * Map default maxzoom level
   */
  maxZoom?: number
  /**
   * Map default minzoom level
   */
  minZoom?: number
  /**
   * Layers with popup
   */
  popupLayerIds?: string[]
  /**
   * Selectable layers organization
   */
  selectableItems?: SelectableItem[]
  /**
   * Title of the map
   */
  title?: string
  /**
   * Subtitle of the map
   */
  subtitle?: string
  /**
   * Legend scales
   */
  legendScales: LegendScale[]
}
