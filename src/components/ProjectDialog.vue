<template>
  <v-dialog
    v-model="isDialogActive"
    height="80%"
    :max-width="'80%'"
    scrollable
    @after-leave="closeDialog"
  >
    <template #default="{ isActive }">
      <project-detail v-if="isActive" v-model="isDialogActive" :project="props.project" />
    </template>
  </v-dialog>
</template>

<script setup lang="ts">
import ProjectDetail from '@/components/ProjectDetail.vue'
import type { Project } from '@/types/Project'
import { computed, defineModel } from 'vue'
import { useRoute, useRouter } from 'vue-router'
const route = useRoute()
const router = useRouter()

const isDialogActive = defineModel({
  type: Boolean,
  default: false
})

const props = defineProps<{
  project: Project | undefined
}>()

const projectId = computed({
  get() {
    return route.query.projectId ?? ''
  },
  set(projectId) {
    router.replace({
      query: { ...route.query, projectId: projectId === '' ? undefined : projectId }
    })
  }
})

const closeDialog = () => {
  projectId.value = ''
}
</script>

<style scoped></style>
