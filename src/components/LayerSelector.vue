<script setup lang="ts">
import type { SelectableItem, SelectableGroupItem, SelectableSingleItem } from '@/utils/layerSelector'
import { watch, ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

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

const { t, locale } = useI18n({ useScope: 'global' })

const genre = ref<string>()
const tab = ref<string>()
const selectableTabs = computed<SelectableItem[]>(() =>
  props.items?.filter((item: SelectableItem) => (item as SelectableGroupItem).tab)
    .flatMap((item: SelectableItem) => (item as SelectableGroupItem).children)
    .filter((item: SelectableSingleItem) => item.genre === genre.value) // filter species by selected genre
)
const tabItems = computed<{ id: string; label: string }[]>(() => selectableTabs.value.map((item) => {
  const label = (item as any)[`label_${locale.value}`]
  return {
    id: item.id,
    label: item.label.length === 0 ? label : `${label} (${item.label})`
  }
}).sort(itemCompare))



watch(() => props.items,
  () => {
    // all selected by default
    genre.value = 'all'
  },
  { immediate: true }
)

function update(genus: string, specie: string) {
  genre.value = genus
  const found = tabItems.value.find((item) => item.id === specie)
  if (found) {
    tab.value = specie
  } else {
    tab.value = tabItems.value[tabItems.value.length - 1].id
  }
  updateLayers()
}

function itemCompare(a: { id: string; label: string }, b: { id: string; label: string }) {
  if (a.id.endsWith('_other')) {
    return 1
  }
  if (a.label < b.label) {
    return -1
  }
  if (a.label > b.label) {
    return 1
  }
  return 0
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
