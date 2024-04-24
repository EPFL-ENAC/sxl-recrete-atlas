<template>
  <v-card :prepend-icon="mdiBullseyeArrow" title="Target Activator">
    <v-card-text>
      Pass any valid querySelector to the activator prop to bind the dialog to the target element.
      {{ project }}
      <v-img class="align-end text-white" height="200" :src="`${project.images?.[0] ?? defaultImage}`" cover>
        <v-card-title>{{ project.name }}</v-card-title>
      </v-img>
    </v-card-text>
    <template v-slot:actions>
      <v-btn class="ml-auto" text="Close" @click="isDialogActive = false"></v-btn>
    </template>
  </v-card>
</template>

<script setup lang="ts">
import { mdiBullseyeArrow } from '@mdi/js';
import { defineModel } from 'vue';
import { defaultImage } from '@/utils/default';


const isDialogActive = defineModel({
  type: Boolean,
  default: false,
})

const project = defineProps<{
  project: any
}>()

</script>

<style scoped></style>