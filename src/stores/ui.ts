import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  // State
  const drawerRail = ref(true)
  const resetMapTrigger = ref(0)

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

  return {
    drawerRail,
    resetMapTrigger,
    toggleDrawerRail,
    setDrawerRail,
    resetMap
  }
})
