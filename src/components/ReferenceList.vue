<template>
  <div style="display: flex">
    <ul>
      <li v-for="(refe, key) in item?.reference" :key="key">
        <span v-if="referencesMap[refe].url">
          [{{ refe }}]:
          <a target="_blank" :href="referencesMap[refe].url">
            {{ referencesMap[refe].text }}
          </a>
        </span>
        <span v-else> [{{ refe }}]: {{ referencesMap[refe].text }} </span>
      </li>
    </ul>
    <div>
      <v-btn icon size="small-x" :class="{ wobble: isWobbling }" @click="handleCopy">
        <v-icon :icon="mdiContentCopy"></v-icon>
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useReferencesStore } from '@/stores/references'
import { storeToRefs } from 'pinia'
import { defineProps, ref } from 'vue'
import { mdiContentCopy } from '@mdi/js'
import { useClipboard } from '@vueuse/core'

const referencesMap = storeToRefs(useReferencesStore()).referencesMap

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})
// todo: use https://docs.sheetjs.com/docs/demos/local/clipboard/
const source = ref(
  props.item?.reference
    .map((refe: string) => {
      if (referencesMap.value[refe].url) {
        return `${refe};${referencesMap.value[refe].text};${referencesMap.value[refe].url}`
      }
      return `${refe}];${referencesMap.value[refe].text};`
    })
    .join('\n')
)
const { copy } = useClipboard({ source })
const isWobbling = ref(false)

function handleCopy() {
  copy()
  isWobbling.value = true
  setTimeout(() => {
    isWobbling.value = false
  }, 500)
}
</script>

<style scoped lang="scss">
@keyframes wobble {
  0% {
    transform: rotate(0deg);
  }
  15% {
    transform: rotate(-15deg);
  }
  30% {
    transform: rotate(15deg);
  }
  45% {
    transform: rotate(-10deg);
  }
  60% {
    transform: rotate(10deg);
  }
  75% {
    transform: rotate(-5deg);
  }
  90% {
    transform: rotate(5deg);
  }
  100% {
    transform: rotate(0deg);
  }
}

.wobble {
  animation: wobble 0.5s;
}
ul {
  li {
    margin-bottom: 0.5rem;

    &:last-child {
      margin-bottom: 0;
    }
  }
}
</style>
