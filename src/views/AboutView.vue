<script setup lang="ts">
import axios from 'axios'
import DOMPurify from 'dompurify'
import { mdiKeyboardBackspace } from '@mdi/js'
import { onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { parseMarkdown } from '@/utils/markdownRenderer'

const { locale } = useI18n({ useScope: 'global' })
const contentHtml = ref<string>('')

onMounted(() => {
  updateAbout()
})

watch(locale, () => {
  updateAbout()
})

function updateAbout() {
  axios
    .get<string>(`about_${locale.value}.md`)
    .then((response) => response.data)
    .then((data) => {
      contentHtml.value = DOMPurify.sanitize(parseMarkdown(data))
    })
}
</script>
<template>
  <!-- eslint-disable vue/no-v-html -->
  <v-container class="pa-3" fluid>
    <div>
      <v-btn to="/" :icon="mdiKeyboardBackspace" flat></v-btn>
    </div>
    <div class="marked ml-3 mr-3" v-html="contentHtml"></div>
  </v-container>
</template>
