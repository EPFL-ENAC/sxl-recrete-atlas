import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  // State
  const drawerRail = ref(false)

  // Actions
  function toggleDrawerRail() {
    drawerRail.value = !drawerRail.value
  }

  function setDrawerRail(value: boolean) {
    drawerRail.value = value
  }

  return {
    drawerRail,
    toggleDrawerRail,
    setDrawerRail
  }
})