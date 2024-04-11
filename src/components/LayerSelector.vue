<script setup lang="ts">
import type { SelectableItem, SelectableGroupItem, SelectableSingleItem, SpeciesItem } from '@/utils/layerSelector'
import { mdiInformation } from '@mdi/js'
import { watch, ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = withDefaults(
  defineProps<{
    modelValue?: string[]
    items?: SelectableItem[],
    species: SpeciesItem[]
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
const genreItems = computed<{ id: string; label: string }[]>(() => {
  const key = `GENRE_${locale.value === 'en' ? 'eng' : locale.value}`
  const items = props.species
    .filter((value, index, array) => array.map((g) => g.GENRE_lat).indexOf(value.GENRE_lat) === index)
    .map((g) => { return { id: g.GENRE_lat.toLowerCase().replace(' ', '_'), label: `${(g as any)[key]} (${g.GENRE_lat})` }})
    .sort(itemCompare)
  items.unshift({ id: 'all', label: t('all_genus') })
  return items
})

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

const selectedSpecie = computed<SpeciesItem | undefined>(() => props.species.find((item) => item.id === tab.value))

function updateGenus() {
  // select the default species or the first one
  const selected = selectableTabs.value.find((item: SelectableItem) => item.selected)
  tab.value = selected ? selected.id : (selectableTabs.value.length > 0 ? selectableTabs.value[0].id : undefined)
  updateLayers()
}

watch(() => props.items,
  () => {
    // all selected by default
    genre.value = 'all'
    updateGenus()
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

function formatNumber(nb: number) {
  return new Intl.NumberFormat(`${locale.value}`).format(nb)
}

function getGenusTreeCountLabel(sel: SpeciesItem | undefined) {
  if (!sel) {
    return formatNumber(props.species
      .filter((value, index, array) => array.map(sp => sp.GENRE_lat).indexOf(value.GENRE_lat) === index)
      .reduce((acc, cur) => acc + cur['GENUS TREE COUNT'], 0))
  } else {
    return formatNumber(sel['GENUS TREE COUNT'])
  }
}

function getGenusShareLabel(sel: SpeciesItem) {
  return formatNumber(Number.parseFloat(sel['GENUS SHARE'].replace('%', ''))) + '%'
}

function getSpecieTreeCountLabel(sel: SpeciesItem) {
  return formatNumber(sel['SPECIE TREE COUNT'])
}

function getSpecieShareLabel(sel: SpeciesItem) {
  return formatNumber(Number.parseFloat(sel['SPECIE SHARE'].replace('%', ''))) + '%'
}

function showDocumentation(type: string) {
  emit('documentation', type)
}
</script>

<template>
  <v-card flat>
    <v-card-text class="pa-0">
      <div class="mt-2">
        <v-select
          v-model="genre"
          :label="$t('genus')"
          :items="genreItems"
          item-title="label"
          item-value="id"
          density="compact"
          class="mt-2 mb-0"
          @update:model-value="updateGenus"
        ></v-select>
        <div
          v-if="selectedSpecie"
          class="pl-4 mb-3">
          <span class="text-caption font-weight-bold text-grey-darken-1">
            {{ $t('trees_count', { count: getGenusTreeCountLabel(selectedSpecie) }) }} ({{ getGenusShareLabel(selectedSpecie) }})
          </span>
          <v-btn :icon="mdiInformation" flat size="small" @click="showDocumentation('genus')"></v-btn>
        </div>
        <div
          v-if="genre === 'all'"
          class="pl-4 mb-3">
          <span class="text-caption font-weight-bold text-grey-darken-1">
            {{ $t('trees_count', { count: getGenusTreeCountLabel(undefined) }) }}
          </span>
          <v-btn :icon="mdiInformation" flat size="small" @click="showDocumentation('genus')"></v-btn>
        </div>
        <div v-if="tab">
          <v-select
            v-model="tab"
            :label="$t('specie')"
            :items="tabItems"
            item-title="label"
            item-value="id"
            density="compact"
            class="mt-2"
            @update:model-value="updateLayers"
          ></v-select>
          <div
            v-if="selectedSpecie"
            class="pl-4 mb-3">
            <span class="text-caption font-weight-bold text-grey-darken-1">
              {{ $t('trees_count', { count: getSpecieTreeCountLabel(selectedSpecie) }) }} ({{ getSpecieShareLabel(selectedSpecie) }})
            </span>
            <v-btn :icon="mdiInformation" flat size="small" @click="showDocumentation('specie')"></v-btn>
          </div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>
