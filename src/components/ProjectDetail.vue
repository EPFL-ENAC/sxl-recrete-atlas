<template>
  <v-card :prepend-icon="mdiBullseyeArrow" title="Target Activator">
    <v-card-text>
      Pass any valid querySelector to the activator prop to bind the dialog to the target element.
      {{ project }}
    </v-card-text>
    <template v-slot:actions>
      <v-btn class="ml-auto" text="Close" @click="isDialogActive = false"></v-btn>
    </template>
  </v-card>
</template>

<script setup lang="ts">
import { mdiBullseyeArrow } from '@mdi/js';
import { defineModel } from 'vue';

const isDialogActive = defineModel({
  type: Boolean,
  default: false,
})

const project = defineProps<{
  project: any
}>()

</script>

<style scoped></style>