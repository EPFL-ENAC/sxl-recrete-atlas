<template>
  <v-card :prepend-icon="mdiBullseyeArrow" :title="props.project.name">

    <v-card-text>
      <v-row>
        <v-col :cols="6">
          <v-row>
            <b>{{ $t("project_description") }}:</b> {{ props.project.description }}
          </v-row>
          <v-row>
            <b>{{ $t("project_receiver_location_country") }}({{ $t("project_receiver_location_city") }}):</b> {{
              props.project.receiver_country }} ({{ props.project.receiver_city }})
          </v-row>
          <v-row>
            <b>{{ $t("project_precs_start_date_year") }}:</b> {{ props.project.start_date_year }}
          </v-row>
        </v-col>
        <v-col :cols="6">
          <v-carousel height="100%">
            <v-carousel-item v-for="(image, $key) in props.project.images" :key="$key" :src="image"  cover height="400px">
            </v-carousel-item>
          </v-carousel>
          <!-- <v-img class="align-end text-white" height="200" :src="`${props.project.images?.[0] ?? defaultImage}`" cover>
            <v-card-title>{{ props.project.name }}</v-card-title>
          </v-img> -->
        </v-col>
      </v-row>
      <v-row>
        <v-col :cols="3">
          <v-row>
            <h3>{{ $t("about_the_donor_site") }}</h3>
          </v-row>
        </v-col>
        <v-col :cols="3">
          <v-row>
            <h3>About the</h3>
          </v-row>
        </v-col>
        <v-col :cols="3">
          <v-row>
            <h3>About the</h3>
          </v-row>
        </v-col>
        <v-col :cols="3">
          <v-row>
            <h3>About the</h3>
          </v-row>
        </v-col>
      </v-row>


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
import type { Project } from '@/types/Project';


const isDialogActive = defineModel({
  type: Boolean,
  default: false,
})

const props = defineProps<{
  project: Project
}>()

</script>

<style scoped></style>

<i18n lang="json">{
  "en": {
    "about_the_donor_site": "About the donor site"
  },
  "fr": {
    "about_the_donor_site": "à propos du site du donneur"
  }
}</i18n>
