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
          <v-carousel v-if="(props.project.images?.length ?? 0) > 0" height="100%">
            <v-carousel-item v-for="(image, $key) in props.project.images" :key="$key" :src="image"  cover height="400px">
              <v-card-title class="image-title">{{ props.project.name }}</v-card-title>
            </v-carousel-item>
          </v-carousel>
          <v-img v-else class="align-end text-white" cover height="400px" :src="`${defaultImage}`">
            <v-card-title class="image-title">{{ props.project.name }}</v-card-title>
          </v-img>
        </v-col>
      </v-row>
      <v-row>
        <v-col :cols="3">
          <v-row>
            <h3>{{ t("about_the_donor_site") }}</h3>
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
    <template #actions>
      <v-btn class="ml-auto" text="Close" @click="isDialogActive = false"></v-btn>
    </template>
  </v-card>
</template>

<script setup lang="ts">
import { mdiBullseyeArrow } from '@mdi/js';
import { defineModel } from 'vue';
import { defaultImage } from '@/utils/default';
import type { Project } from '@/types/Project';
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const isDialogActive = defineModel({
  type: Boolean,
  default: false,
})

const props = defineProps<{
  project: Project
}>()

</script>

<style scoped>
.image-title {
  text-shadow: -1px 0 white, 0 1px white, 1px 0 white, 0 -1px white;
    font-family: sans;
    color: black;
}</style>

<i18n lang="json">
{
  "en": {
    "about_the_donor_site": "About the donor site"
  },
  "fr": {
    "about_the_donor_site": "à propos du site du donneur"
  }
}
</i18n>
