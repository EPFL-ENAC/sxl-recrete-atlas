<script setup lang="ts">
import MarkdownDialog from '@/components/MarkdownDialog.vue'
import {
  mdiBagPersonalTagOutline,
  mdiFileDocument,
  mdiInformation,
  mdiLibraryOutline,
  mdiMapOutline,
  mdiPlayBox
} from '@mdi/js'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterView } from 'vue-router'
import { useCookies } from 'vue3-cookies'
import { useLocale } from 'vuetify'
import epflLogoUrl from '/EPFL_Logo_184X53.svg'

// const showHome = ref<boolean>(false)
// const secret = ref<string>()

const { current } = useLocale()
const { locale } = useI18n({ useScope: 'global' })
const { cookies } = useCookies()

const openWelcome = computed<boolean>(() => cookies.get('welcome') !== '1')
const showWelcome = ref<boolean>(false)
const welcomeOpened = computed<boolean>(() => openWelcome.value || showWelcome.value)

function onLocale(lang: string) {
  locale.value = lang
  current.value = lang
  cookies.set('locale', lang, '365d')
}

function welcomeClosed() {
  cookies.set('welcome', '1', '365d')
  showWelcome.value = false
}

function welcomeOpen() {
  showWelcome.value = true
}

function getCurrentLocaleOrFallback() {
  return ['en', 'fr'].includes(current.value) ? current.value : 'en'
}
</script>

<template>
  <v-app>
    <v-app-bar flat height="68">
      <v-app-bar-title>
        <div class="text-h5">{{ $t('app_title') }}</div>
        <div class="text-subtitle-2">{{ $t('app_subtitle') }}</div>
      </v-app-bar-title>

      <v-menu activator="#locales-activator">
        <v-list>
          <v-list-item v-for="(lang, index) in $i18n.availableLocales" :key="index">
            <v-list-item-title @click="onLocale(lang)">{{ $t(lang) }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-btn
        :to="{ name: `list` }"
        :icon="mdiLibraryOutline"
        class="mr-3"
        :title="$t('list')"
      ></v-btn>
      <v-btn :to="{ name: `home` }" :icon="mdiMapOutline" class="mr-3" :title="$t('home')"></v-btn>
      <!-- <v-btn
        :to="{ name: `specialized-documentation` }"
        :icon="mdiFileDocument"
        class="mr-3"
        :title="$t('specialized-documentation')"
      ></v-btn>
      <v-btn
        :to="{ name: `concrete-reuse-in-short` }"
        :icon="mdiBagPersonalTagOutline"
        class="mr-3"
        :title="$t('concrete-reuse-in-short')"
      ></v-btn> -->

      <!-- <v-btn
        :icon="mdiPlayBox"
        class="mr-3"
        :title="$t('introduction')"
        @click="welcomeOpen()"
      ></v-btn> -->
      <v-btn to="/about" :icon="mdiInformation" class="mr-3" :title="$t('about')"></v-btn>

      <v-btn id="locales-activator" color="primary" class="mr-2">
        {{ getCurrentLocaleOrFallback() }}
      </v-btn>

      <template #append>
        <a href="https://epfl.ch" target="_blank">
          <v-img :src="epflLogoUrl" width="100px" />
        </a>
      </template>
    </v-app-bar>
    <v-main>
      <RouterView />
      <markdown-dialog
        :button-text="$t('start')"
        :content-url="`welcome_${locale}.md`"
        :open="welcomeOpened"
        width="800px"
        @dialog-close="welcomeClosed"
      >
      </markdown-dialog>
    </v-main>
  </v-app>
</template>

<style lang="scss" scoped>
.v-app-bar {
  border-bottom: 1px solid rgb(var(--v-theme-primary));
}
</style>
