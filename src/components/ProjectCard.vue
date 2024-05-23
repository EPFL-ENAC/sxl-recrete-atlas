<template>
  <v-card
    class="mx-auto"
    min-width="80%"
    max-width="80%"
    max-height="80%"
    min-height="80%"
    outlined
    tile
  >
    <v-img class="align-end text-white" height="200" :src="`${item.images?.[0] ?? defaultImage}`" cover>
      <v-card-title>{{ item[`name_${locale as ProjectLang}`] }}</v-card-title>
    </v-img>
<!-- 
    <v-card-subtitle class="pt-4">
      {{ item._id }}
    </v-card-subtitle> -->

    <v-card-text>
      <span  style="text-overflow: ellipsis;">

        {{ item[`description_${locale as ProjectLang}`] }}
      </span>
    </v-card-text>

  </v-card>
</template>

<script setup lang="ts">
import type { ProjectLang } from '@/types/Project';
import { defaultImage } from '@/utils/default';
import { useI18n } from 'vue-i18n';
defineProps({
  item: {
    type: Object,
    required: true
  }
})

const { locale } = useI18n({ useScope: 'global' })

</script>

<style scoped></style>
