<script setup lang="ts">
import JsonWebMap from '@/components/JsonWebMap.vue'
import ProjectDialog from '@/components/ProjectDialog.vue'
import { useConfigurationStore } from '@/stores/configuration'
import type { Project } from '@/types/Project'
import { ref } from 'vue'
const { parametersUrl, styleUrl } = useConfigurationStore()
const isProjectDialogOpen = ref(false)
const projectSelected = ref<Project | undefined>(undefined)
</script>

<template>
  <JsonWebMap
    v-model:isProjectDialogOpen="isProjectDialogOpen"
    v-model:project="projectSelected"
    :parameters-url="parametersUrl"
    :style-url="styleUrl"
  />
  <project-dialog v-model="isProjectDialogOpen" :project="projectSelected" />
</template>
