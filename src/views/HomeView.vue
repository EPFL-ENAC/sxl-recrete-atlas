<script setup lang="ts">
import JsonWebMap from '@/components/JsonWebMap.vue'
import ProjectDialog from '@/components/ProjectDialog.vue'
import { useConfigurationStore } from '@/stores/configuration'
import { ref } from 'vue'
const { parametersUrl, styleUrl, cdnUrl, martinUrl } = useConfigurationStore()
const isProjectDialogOpen = ref(false)
const projectSelected = ref<any>(undefined)
</script>

<template>
  <JsonWebMap
    v-model:isProjectDialogOpen="isProjectDialogOpen"
    v-model:project="projectSelected"
    :parameters-url="parametersUrl"
    :style-url="styleUrl"
    :cdn-url="cdnUrl"
    :martin-url="martinUrl"
  />
  <project-dialog v-model="isProjectDialogOpen" :project="projectSelected" />
</template>
