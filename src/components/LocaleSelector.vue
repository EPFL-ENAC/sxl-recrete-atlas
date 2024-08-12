<template>
  <div>
    <v-tooltip location="bottom">
      <template #activator="{ props: activatorProps }">
        <v-select
          v-bind="activatorProps"
          v-model="selectedLocale"
          :items="availableLocales"
          variant="underlined"
          density="compact"
          @update:model-value="onLocaleChange"
        ></v-select>
      </template>
      <span>{{ t('choose-your-lang') }}</span>
    </v-tooltip>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCookies } from 'vue3-cookies'

const { t, locale, availableLocales } = useI18n({ useScope: 'global' })
const { cookies } = useCookies()

const selectedLocale = ref(locale.value)

watch(locale, (newLocale) => {
  selectedLocale.value = newLocale
})

// Handle locale change
function onLocaleChange(newLocale: string) {
  locale.value = newLocale
  cookies.set('locale', newLocale, '365d')
}
</script>
