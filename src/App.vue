<script setup lang="ts">
import MarkdownDialog from '@/components/MarkdownDialog.vue'
import {
  mdiInformation,
  mdiPlusBox,
  mdiListBox,
  mdiGrid,
  mdiMapOutline,
} from '@mdi/js'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterView } from 'vue-router'
import { useCookies } from 'vue3-cookies'
import { useLocale } from 'vuetify'
import epflLogoUrl from '/EPFL_Logo_184X53.svg'

const { current } = useLocale()
const { locale } = useI18n({ useScope: 'global' })
const { cookies } = useCookies()

const showProjectOpen =  ref<boolean>(false)
const addProjectOpened = computed<boolean>(() => showProjectOpen.value)

function onLocale(lang: string) {
  locale.value = lang
  current.value = lang
  cookies.set('locale', lang, '365d')
}

function addProjectClosed() {
  showProjectOpen.value = false
}

function addProjectOpen() {
  showProjectOpen.value = true
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
            <v-list-item-title tag="button" @click="onLocale(lang)">{{ $t(lang) }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-btn
        :to="{ name: `list`, query: { view: 'list' }}"
        :active="$route.query.view === 'list'"
        :icon="mdiListBox"
        class="mr-3"
        :title="$t('list')"
      ></v-btn>
      <v-btn
        :to="{ name: `list` , query: { view: 'grid' }}"
        :active="$route.query.view === 'grid'"
        :icon="mdiGrid"
        class="mr-3"
        :title="$t('grid')"
      ></v-btn>
      <v-btn :to="{ name: `home` }" :icon="mdiMapOutline" class="mr-3" :title="$t('home')"></v-btn>

      <v-btn
        :icon="mdiPlusBox"
        class="mr-3"
        :title="$t('add_project')"
        @click="addProjectOpen()"
      ></v-btn>
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
        :button-text="$t('close')"
        :content-url="`add_project_${locale}.md`"
        :open="addProjectOpened"
        width="800px"
        @dialog-close="addProjectClosed"
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
