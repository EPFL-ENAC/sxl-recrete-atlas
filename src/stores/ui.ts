import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  // State
  const drawerRail = ref(true)
  const resetMapTrigger = ref(0)
  const mapInstance = ref<maplibregl.Map | null>(null)

  // Actions
  function toggleDrawerRail() {
    drawerRail.value = !drawerRail.value
  }

  function setDrawerRail(value: boolean) {
    drawerRail.value = value
  }

  function resetMap() {
    resetMapTrigger.value++
  }

  function setMap(map: maplibregl.Map) {
    // You can store the map instance in the store if needed
    // For example: this.mapInstance = map
    console.log('Map instance set in UI store:', map)
    mapInstance.value = map
  }

  // Return state and actions
  function getMap() {
    // Return the map instance if stored
    return mapInstance.value
  }

  return {
    drawerRail,
    resetMapTrigger,
    toggleDrawerRail,
    setDrawerRail,
    resetMap,
    setMap,
    getMap
  }
})
