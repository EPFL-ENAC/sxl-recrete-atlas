<template>
  <v-dialog v-model="isDialogActive" max-width="800">
    <template #default="{ isActive }">
      <project-detail v-if="isActive" v-model="isDialogActive" :project="props.project"/>
    </template>
  </v-dialog>

</template>

<script setup lang="ts">
import ProjectDetail from '@/components/ProjectDetail.vue';
import { defineModel } from 'vue';

const isDialogActive = defineModel({
  type: Boolean,
  default: false,
})

const props = defineProps<{
  project: any
}>()

</script>

<style scoped></style>