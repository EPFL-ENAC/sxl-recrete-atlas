<template>
  <v-card
    class="mx-auto"
    min-width="100%"
    max-width="100%"
    max-height="100%"
    min-height="100%"
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
    <v-card-text v-if="item[`description_${locale as ProjectLang}`]" class="text-overflow">
      <span>
        {{ item[`description_${locale as ProjectLang}`] }}
      </span>
    </v-card-text>
    <v-card-text
      v-else
      class="d-flex justify-center align-center text-align-center"
      style="
        transform: translateY(-6px) translateX(67px) rotate(-25deg);
        opacity: 0.1;
        font-size: 1.8rem;
        height: 130px;
        width: 200px;
        border: 2px dashed;
        border-radius: 12px;
        text-transform: uppercase;
        font-weight: bold;
      "
    >
      <span>
        {{ $t('No description available') }}
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
  line-clamp: var(--max-lines);
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
