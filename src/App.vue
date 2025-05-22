<script setup lang="ts">
import MarkdownDialog from '@/components/MarkdownDialog.vue'
import {
  mdiWrench,
  mdiInformation,
  mdiDownload,
  mdiPlusBox,
  mdiListBox,
  mdiGrid,
  mdiMapOutline,
  mdiCommentQuestionOutline,
  mdiClose
} from '@mdi/js'
import data from '@/assets/data/data.json'
import type { Project } from '@/types/Project'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterView } from 'vue-router'
import { useCookies } from 'vue3-cookies'
import { useProjectsStore } from '@/stores/projects'
// import { useLocale } from 'vuetify'
import epflLogoUrl from '/EPFL_Logo_184X53.svg'
// import LocaleSelector from './components/LocaleSelector.vue'
import { useUiStore } from '@/stores/ui'
import { storeToRefs } from 'pinia'
import { defaultAppHeaderHeight } from '@/utils/default'
import { downloadBundle, downloadFilteredData } from '@/utils/downloadBundle'

const projects = storeToRefs(useProjectsStore()).projects

// const { current } = useLocale()
const { locale } = useI18n({ useScope: 'global' })

const { cookies } = useCookies()
const openWelcome = computed<boolean>(() => cookies.get('welcome') !== '1')
const showWelcome = ref<boolean>(openWelcome.value)
const welcomeOpened = computed<boolean>(() => openWelcome.value || showWelcome.value)

function welcomeClosed() {
  cookies.set('welcome', '1', '365d')
  showWelcome.value = false
}

const showProjectOpen = ref<boolean>(false)
const showDownloadOpen = ref<boolean>(false)
const addProjectOpened = computed<boolean>(() => showProjectOpen.value)

const downloadDataOpened = computed<boolean>(() => showDownloadOpen.value)

function addProjectClosed() {
  showProjectOpen.value = false
}

function addProjectOpen() {
  showProjectOpen.value = true
}

function downloadDataClosed() {
  showDownloadOpen.value = false
}
function downloadDataOpen() {
  showDownloadOpen.value = true
}

const uiStore = useUiStore()
const { drawerRail } = storeToRefs(uiStore)

function handleError(error: unknown) {
  const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.'
  alert(errorMessage)
}

function downloadAllData() {
  // const filtered = getCurrentFilteredData(); // however you store it
  downloadBundle(data as Project[]).catch(handleError)
}
function downloadFilteredDataBtn() {
  // const filtered = getCurrentFilteredData(); // however you store it
  downloadFilteredData(projects.value).catch(handleError)
}
</script>

<template>
  <v-app>
    <v-app-bar flat :style="`height: ${defaultAppHeaderHeight}`" class="justify-center">
      <v-app-bar-title class="flex-1-1">
        <div class="text-h5">{{ $t('app_title') }}</div>
        <div class="text-subtitle-2">{{ $t('app_subtitle') }}</div>
      </v-app-bar-title>
      <div class="flex-shrink-1 flex-grow-1">
        <div class="text-h5">
          {{ $t('app_wip_title') }}<v-icon class="ml-5"> {{ mdiWrench }}</v-icon>
        </div>
        <div class="text-subtitle-2">
          {{ $t('app_wip_subtitle') }}
        </div>
      </div>
      <!--
      <v-menu activator="#locales-activator">
        <v-list>
          <v-list-item v-for="(lang, index) in $i18n.availableLocales" :key="index">
            <v-list-item-title tag="button" @click="onLocale(lang)"
              >{{ $t(lang) }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      -->
      <div class="main-group-btn">
        <v-tooltip location="bottom">
          <template #activator="{ props: activatorProps }">
            <v-btn
              v-bind="activatorProps"
              :to="{ name: `list`, query: { view: 'list' } }"
              :active="$route.query.view === 'list'"
              :icon="mdiListBox"
              class="mr-3"
              :title="$t('list')"
            ></v-btn>
          </template>
          <template #default>
            {{ $t('list') }}
          </template>
        </v-tooltip>
        <v-tooltip location="bottom">
          <template #activator="{ props: activatorProps }">
            <v-btn
              v-bind="activatorProps"
              :to="{ name: `list`, query: { view: 'grid' } }"
              :active="$route.query.view === 'grid'"
              :icon="mdiGrid"
              class="mr-3"
              :title="$t('grid')"
            ></v-btn>
          </template>
          <span>{{ $t('grid') }} </span>
        </v-tooltip>

        <v-tooltip location="bottom">
          <template #activator="{ props: activatorProps }">
            <v-btn
              v-bind="activatorProps"
              :to="{ name: `home` }"
              :icon="mdiMapOutline"
              class="mr-3"
              :title="$t('map')"
            ></v-btn>
          </template>
          <span>{{ $t('map') }} </span>
        </v-tooltip>
      </div>
      <v-tooltip location="bottom">
        <template #activator="{ props: activatorProps }">
          <v-btn
            size="default"
            v-bind="activatorProps"
            :icon="mdiPlusBox"
            class="mr-3"
            :title="$t('add_project')"
            @click="addProjectOpen()"
          ></v-btn>
        </template>
        <span>{{ $t('add_project') }} </span>
      </v-tooltip>
      <v-tooltip location="bottom">
        <template #activator="{ props: activatorProps }">
          <v-btn
            size="default"
            v-bind="activatorProps"
            :icon="mdiDownload"
            class="mr-3"
            :title="$t('download_data_filtered')"
            @click="downloadDataOpen()"
          ></v-btn>
        </template>
        <span>{{ $t('download_data_filtered') }} </span>
      </v-tooltip>
      <v-tooltip location="bottom">
        <template #activator="{ props: activatorProps }">
          <v-btn
            size="default"
            v-bind="activatorProps"
            to="/about"
            :icon="mdiInformation"
            class="mr-3"
            :title="$t('about')"
          ></v-btn>
        </template>
        <span>{{ $t('about') }} </span>
      </v-tooltip>
      <v-tooltip location="bottom">
        <template #activator="{ props: activatorProps }">
          <v-btn
            size="default"
            v-bind="activatorProps"
            to="/faq"
            :icon="mdiCommentQuestionOutline"
            class="mr-3"
            :title="$t('faq')"
          ></v-btn>
        </template>
        <span>{{ $t('faq') }} </span>
      </v-tooltip>
      <!-- <LocaleSelector class="mr-5" /> -->

      <template #append>
        <a href="https://www.epfl.ch/labs/sxl/" target="_blank" class="pl-10 pr-5">
          <v-img :src="epflLogoUrl" width="100px" />
        </a>
      </template>
    </v-app-bar>
    <v-main
      :style="`--v-layout-left: ${!drawerRail ? 'max(450px, 25vw)' : '64px'};
      --v-layout-right: 0px;
      --v-layout-top: ${defaultAppHeaderHeight};
      --v-layout-bottom: 0px;`"
    >
      <RouterView />
      <markdown-dialog
        :button-text="$t('close')"
        :content-url="`welcome_${locale}.md`"
        :open="welcomeOpened"
        width="800px"
        @dialog-close="welcomeClosed"
      >
      </markdown-dialog>
      <markdown-dialog
        :button-text="$t('close')"
        :content-url="`add_project_${locale}.md`"
        :open="addProjectOpened"
        width="800px"
        @dialog-close="addProjectClosed"
      >
      </markdown-dialog>

      <v-dialog
        v-model="downloadDataOpened"
        :width="800"
        :max-width="'fit-content'"
        :style="{ 'z-index': 1000 }"
        :transition="false"
      >
        <v-card>
          <v-card-actions>
            <v-btn :text="$t('close')" :icon="mdiClose" @click="downloadDataClosed"> </v-btn>
          </v-card-actions>
          <v-card-text class="d-flex justify-center">
            <v-btn @click="downloadAllData"> {{ $t('download_all_data') }}</v-btn>
          </v-card-text>
          <v-card-text class="d-flex justify-center">
            <v-btn @click="downloadFilteredDataBtn"> {{ $t('download_data_filtered') }}</v-btn>
          </v-card-text>
        </v-card>
      </v-dialog>
    </v-main>
  </v-app>
</template>

<style lang="scss" scoped>
.v-app-bar {
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
.main-group-btn {
  justify-content: end;
  align-items: end;
  display: flex;
  border-right: 1px solid black;
  margin-right: 1rem;
  padding-right: 1rem;
}
</style>

<i18n>
  {
    "en": {
      "choose-your-lang": "Choose your language",
    },
    "fr": {
      "choose-your-lang": "Choisissez votre langue",
    }
  }
</i18n>
