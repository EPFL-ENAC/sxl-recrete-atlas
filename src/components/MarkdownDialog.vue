<script setup lang="ts">
import axios from 'axios'
import DOMPurify from 'dompurify'
import { useDisplay } from 'vuetify'
import { parseMarkdown } from '@/utils/markdownRenderer'

// import LocaleSelector from '../components/LocaleSelector.vue'

import { onMounted, ref } from 'vue'
import { watch } from 'vue'

const props = withDefaults(
  defineProps<{
    name?: string
    contentUrl: string
    width?: string
    open?: boolean
    buttonText?: string
  }>(),
  {
    name: undefined,
    contentUrl: undefined,
    width: 'unset',
    open: false,
    buttonText: undefined
  }
)

const emit = defineEmits(['dialogClose'])

const dialog = ref<boolean>(false)
const { mobile } = useDisplay()
const contentHtml = ref<string>('')

watch(
  () => props.open,
  (open) => {
    dialog.value = open
  }
)


watch(
  () => props.contentUrl,
  (contentUrl) => {
    axios
      .get<string>(contentUrl)
      .then((response) => response.data)
      .then((data) => {
        contentHtml.value = DOMPurify.sanitize(parseMarkdown(data))
      })
  }
)

onMounted(() => {
  if (props.open) {
    dialog.value = true
  }
  axios
    .get<string>(props.contentUrl)
    .then((response) => response.data)
    .then((data) => {
      contentHtml.value = DOMPurify.sanitize(parseMarkdown(data))
    })
})

function close() {
  dialog.value = false
  emit('dialogClose')
}
</script>

<template>
  <!-- eslint-disable vue/no-v-html -->
  <v-dialog
    v-model="dialog"
    :width="width"
    :fullscreen="mobile"
    @update:model-value="emit('dialogClose')"
  >
    <v-card class="text-justify">
      <v-card-title v-if="name" class="d-flex justify-space-between align-center">
        {{ name }}
      </v-card-title>
      <v-card-text>
        <!-- <LocaleSelector class="locale-selector" /> -->
        <br v-if="!name" />
        <div class="marked" v-html="contentHtml"></div>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn v-if="buttonText" @click="close">
          {{ buttonText }}
        </v-btn>
        <v-btn v-else icon @click="close()">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.locale-selector {
  position: fixed;
  right: 0;
  top: 0;
  padding: 24px;
}
</style>
