<script setup lang="ts">
import type { SelectableItem, SelectableGroupItem, SelectableSingleItem } from '@/utils/layerSelector'
import { watch, ref, computed } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue?: string[]
    items?: SelectableItem[]
  }>(),
  {
    modelValue: () => [],
    items: () => [],
  }
)
const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
  (e: 'documentation', value: string): void
}>()

defineExpose({
  update
})

const genre = ref<string>()
const tab = ref<string>()
const selectableTabs = computed<SelectableItem[]>(() =>
  props.items?.filter((item: SelectableItem) => (item as SelectableGroupItem).tab)
    .flatMap((item: SelectableItem) => (item as SelectableGroupItem).children)
    .filter((item: SelectableSingleItem) => item.genre === genre.value) // filter species by selected genre
)


watch(() => props.items,
  () => {
    // all selected by default
    genre.value = 'all'
  },
  { immediate: true }
)

function update() {
  updateLayers()
}

function updateLayers() {
  let sels: string[] = []
  if (tab.value) { 
    const map = selectableTabs.value.filter((item: SelectableItem) => item.id === tab.value).pop()
    if (map) {
      sels.push(map.id)
    }
  } else if (genre.value == 'all') {
    sels = props.items?.filter((item: SelectableItem) => (item as SelectableGroupItem).tab)
      .flatMap((item: SelectableItem) => (item as SelectableGroupItem).children)
      .map((item: SelectableSingleItem) => item.id)
  }
  emit('update:modelValue', sels)
}


</script>

<template>
  <v-card flat>
    <v-card-text class="pa-0">
    </v-card-text>
  </v-card>
</template>
