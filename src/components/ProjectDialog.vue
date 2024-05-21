<template>
  <v-dialog
v-model="isDialogActive" max-width="80%" height="80%"
    @after-leave="closeDialog">
    <template #default="{ isActive }">
      <project-detail v-if="isActive" v-model="isDialogActive" :project="props.project"/>
    </template>
  </v-dialog>

</template>

<script setup lang="ts">
import ProjectDetail from '@/components/ProjectDetail.vue';
import { computed, defineModel } from 'vue';
import { useRoute, useRouter } from 'vue-router';
const route = useRoute()
const router = useRouter()

const isDialogActive = defineModel({
  type: Boolean,
  default: false,
})

const props = defineProps<{
  project: any
}>()


const projectId = computed({
  get() {
    return route.query.projectId ?? ''
  },
  set(projectId) {
    router.replace({query: {...route.query, projectId: projectId === '' ? undefined : projectId } })
  }
})

const closeDialog = () => {
  projectId.value = '';
}


</script>

<style scoped></style>