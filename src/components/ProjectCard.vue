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
    <v-img
      class="align-end text-white"
      height="200"
      :src="`${item.images?.[0] ?? defaultImage}`"
      cover
    >
      <v-card-title>{{ item[`name_${locale as ProjectLang}`] }}</v-card-title>
    </v-img>
    <v-card-text class="text-overflow">
      <span>
        {{ item[`description_${locale as ProjectLang}`] }}
      </span>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import type { ProjectLang } from '@/types/Project'
import { defaultImage } from '@/utils/default'
import { useI18n } from 'vue-i18n'
defineProps({
  item: {
    type: Object,
    required: true
  }
})

const { locale } = useI18n({ useScope: 'global' })
</script>

<style>
.text-overflow {
  --max-lines: 6;
  --lh: 1.425rem;
  position: relative;
  max-height: calc(var(--lh) * var(--max-lines));
  overflow: hidden;
  padding-right: 1rem;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: var(--max-lines);
  overflow: hidden;
  text-overflow: ellipsis;
}
/* .text-overflow::before {
  position: absolute;
  content: "...";
  bottom: 0;
  right: 0;
}
.text-overflow::after {
  content: "";
  position: absolute;
  right: 0;
  width: 1rem;
  height: 1rem;
  background: white;
} */
</style>
