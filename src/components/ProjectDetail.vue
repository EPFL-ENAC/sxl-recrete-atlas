<template>
  <v-card v-if="props.project" class="project-detail-card">
    <v-card-item :prepend-icon="mdiDomain">
      <v-card-title class="d-flex">
        <span>{{ props.project[`name_${locale as ProjectLang}`] }}</span>
        <v-btn size="small" class="ml-auto" text="Close" @click="closeDialog"></v-btn>
      </v-card-title>
    </v-card-item>
    <v-card-item>
      <v-card-text>
        <v-row class="mb-4">
          <v-col :cols="6">
            <v-row>
              <b class="key">{{ $t(`description_${locale as ProjectLang}`) }}: </b>
              {{ props.project[`description_${locale as ProjectLang}`] }}
            </v-row>

            <v-row>
              <h3 class="text-decoration-underline">{{ t('about_the_receiving_project') }}</h3>
            </v-row>
            <v-row>
              <b class="key"
                >{{ $t('receiver_country') }}
                <span v-if="props.project.receiver_city">({{ $t('receiver_city') }})</span>
                :
              </b>
              <span
                >{{ $t('countryFn', [props.project.receiver_country]) }}
                <span v-if="props.project.receiver_city">
                  ({{ props.project.receiver_city }})
                </span>
              </span>
            </v-row>
            <v-row>
              <b class="key">{{ $t('start_date_year') }}: </b>
              <span
                :class="{
                  'font-italic': props.project.date_uncertainty,
                  'text-grey': props.project.date_uncertainty
                }"
              >
                {{ props.project.start_date_year }}
              </span>
            </v-row>
          </v-col>
          <v-col :cols="6">
            <v-carousel
              v-if="(props.project.images?.length ?? 0) > 0"
              v-model="carouselIndex"
              height="90%"
              :show-arrows="false"
              :interval="3000"
            >
              <v-carousel-item
                v-for="(image, $key) in props.project.images"
                :key="$key"
                :src="image"
                content-class="carousel-content"
                cover
                height="300px"
              >
              </v-carousel-item>
            </v-carousel>
            <v-img
              v-else
              class="align-end text-white"
              cover
              height="300px"
              :src="`${defaultImage}`"
            >
            </v-img>
            <v-card-title
              class="image-title d-flex flex-spacebetween"
              style="gap: 1rem; align-items: center"
            >
              <v-card-subtitle>
                <span v-if="props.project?.images_credits?.length ?? 0 > 0">
                  {{ t('credits') }}:
                  {{ props.project?.images_credits?.[carouselIndex] }}
                </span>
              </v-card-subtitle>
            </v-card-title>
          </v-col>
        </v-row>
        <v-row class="ga-3">
          <v-col
            v-if="
              props.project.distance_km ||
              (props.project.donor_use?.length ?? 0) > 0 ||
              project_construction_year > 0
            "
            :cols="3"
          >
            <v-row>
              <h3 class="text-decoration-underline">{{ t('about_the_donor_site') }}</h3>
            </v-row>
            <v-row v-if="props.project.distance_km">
              <b class="key">{{ $t('distance_km') }}:</b>

              <i v-if="props.project.distance_uncertainty">
                {{ props.project.distance_km }}
              </i>
              <span v-else>{{ props.project.distance_km }}</span>
            </v-row>
            <v-row v-if="(props.project.donor_use?.length ?? 0) > 0">
              <b class="key">{{ $t('donor_use') }}:</b> {{ props.project.donor_use?.join(', ') }}
            </v-row>
            <v-row v-if="project_construction_year > 0">
              <b class="key">{{ t('construction_year') }}:</b>
              <i v-if="props.project.age_uncertainty || props.project.date_uncertainty">
                {{ project_construction_year }}
              </i>
              <span v-else>{{ project_construction_year }}</span>
            </v-row>
          </v-col>
          <v-col
            v-if="
              props.project.quantity_reclaimed ||
              (props.project.donor_element_type?.length ?? 0) > 0 ||
              (props.project.receiver_element_type?.length ?? 0) > 0 ||
              props.project.component_age
            "
            :cols="3"
          >
            <v-row>
              <h3 class="text-decoration-underline">{{ t('about_the_reused_concrete') }}</h3>
            </v-row>
            <v-row v-if="props.project.quantity_reclaimed">
              <b class="key">{{ $t('quantity_reclaimed') }}:</b>
              {{ props.project.quantity_reclaimed }} ({{ props.project.quantity_reclaimed_unit }})
            </v-row>

            <v-row v-if="(props.project.donor_element_type?.length ?? 0) > 0">
              <b class="key">{{ $t('donor_element_type') }}:</b>
              {{ props.project.donor_element_type?.join(', ') }}
            </v-row>
            <v-row v-if="(props.project.receiver_element_type?.length ?? 0) > 0">
              <b class="key">{{ $t('receiver_element_type') }}:</b>
              {{ props.project.receiver_element_type?.join(', ') }}
            </v-row>
            <v-row v-if="props.project.component_age">
              <b class="key">{{ $t('component_age') }}:</b>
              <i v-if="props.project.age_uncertainty">
                {{ props.project.component_age }}
              </i>
              <span v-else>{{ props.project.component_age }}</span>
            </v-row>

            <v-row>
              <!-- TODO: CIP for instance: use equivalent Cast in Place text for i18n-->
              <b class="key">{{ $t('main_concrete_type') }}:</b>
              <ul class="comma-separated-list">
                <li v-for="(concrete_type, $key) in props.project.main_concrete_type" :key="$key">
                  <span
                    :class="{
                      'font-italic': props.project?.main_concrete_type_uncertainty?.[$key],
                      'text-grey': props.project?.main_concrete_type_uncertainty?.[$key]
                    }"
                    >{{ $t(concrete_type) }}</span
                  >
                </li>
              </ul>
            </v-row>
          </v-col>
          <v-col
            v-if="
              props.project.impact_difference ||
              props.project.cost_difference_max_percent ||
              props.project?.other
            "
            :cols="3"
          >
            <v-row>
              <h3 class="text-decoration-underline">{{ t('about_the_new_project') }}</h3>
            </v-row>
            <v-row v-if="props.project.impact_difference">
              <b class="key">{{ $t('impact_design_alternative') }}:</b>
              {{ props.project.impact_difference }}
              <!-- {{ props.project.impact_unit }} -->
              {{ t('compared_to') }} {{ props.project.cost_design_alternative }}
              <v-tooltip v-if="props.project.impact_source" text="Tooltip">
                <template #activator="{ props: activatorProps }">
                  <v-icon v-bind="activatorProps">{{ mdiInformationBoxOutline }} props</v-icon>
                </template>
                <span>{{ t('impact_source_tooltip') }}: {{ props.project.impact_source }}</span>
              </v-tooltip>
            </v-row>

            <v-row v-if="props.project.cost_difference_max_percent">
              <b class="key">{{ $t('cost_difference_max_percent') }}:</b>
              {{ props.project.cost_difference_max_percent }} % {{ t('compared_to') }}
              {{ props.project.cost_design_alternative }}
              <v-tooltip v-if="props.project.cost_source" text="Tooltip">
                <template #activator="{ props: propsActivator }">
                  <v-icon v-bind="propsActivator">{{ mdiInformationBoxOutline }} props</v-icon>
                </template>
                <span>{{ t('cost_source_tooltip') }}: {{ props.project.cost_source }}</span>
              </v-tooltip>
            </v-row>

            <v-row v-if="props.project?.other">
              <b class="key">{{ $t('other') }}:</b> {{ props.project.other }}
            </v-row>

            <v-row v-if="(props.project.actors?.length ?? 0) > 0">
              <b class="key">{{ t('actors') }}:</b>
              {{ props.project.actors?.join(',') ?? $t('unknown') }}
            </v-row>
          </v-col>
          <v-col :cols="3">
            <v-row>
              <h3 class="text-decoration-underline">{{ t('more_information') }}</h3>
            </v-row>
            <v-row>
              <b class="key">{{ $t('reference') }}:</b> {{ props.project.reference?.join(', ') }}
              <VDropdown :distance="6" popper-class="popper-class" :placement="'top-end'">
                <!-- This will be the popover reference (for the events and position) -->
                <button>
                  <v-icon :icon="mdiInformationSlabCircle"></v-icon>
                </button>

                <!-- This will be the content of the popover -->
                <template #popper>
                  <ReferenceList :item="props.project" />
                </template>
              </VDropdown>
            </v-row>
            <v-row v-if="(props.project.actors?.length ?? 0) > 0">
              <b class="key">{{ t('case_study_actors') }}:</b>
              {{ props.project.actors?.join(', ') ?? $t('unknown') }}
            </v-row>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card-item>
    <template #actions>
      <div
        v-if="props.project?.fact_sheet_contributors"
        class="text-grey text-caption text-right mt-4"
      >
        {{ t('project_sheet_contributors') }}: {{ 
          Array.isArray(props.project.fact_sheet_contributors) 
            ? props.project.fact_sheet_contributors.join(', ')
            : props.project.fact_sheet_contributors || $t('unknown') 
        }}
      </div>
    </template>
  </v-card>
</template>

<script setup lang="ts">
import { mdiDomain, mdiInformationBoxOutline, mdiInformationSlabCircle } from '@mdi/js'
import { computed, defineModel, ref } from 'vue'
import { defaultImage } from '@/utils/default'
import type { Project, ProjectLang } from '@/types/Project'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import ReferenceList from '@/components/ReferenceList.vue'
import { Dropdown as VDropdown } from 'floating-vue'

const route = useRoute()
const router = useRouter()
const { locale } = useI18n({ useScope: 'global' })
const { t } = useI18n()

const isDialogActive = defineModel({
  type: Boolean,
  default: false
})

const props = defineProps<{
  project: Project | undefined
}>()

const carouselIndex = ref(0)

const projectId = computed({
  get() {
    return route.query.projectId ?? ''
  },
  set(projectId) {
    router.replace({
      query: { ...route.query, projectId: projectId === '' ? undefined : projectId }
    })
  }
})

const closeDialog = () => {
  isDialogActive.value = false
  projectId.value = ''
}

const project_construction_year = computed(() => {
  return (props?.project?.start_date_year ?? 0) - (props?.project?.component_age ?? 0)
})
</script>

<style scoped>
:deep(.carousel-content) {
  justify-content: flex-start;
  align-items: end;
  display: flex;
}

.project-detail-card {
  margin: auto;
  justify-content: space-between;
}

.image-title {
  /* text-shadow: -1px 0 white, 0 1px white, 1px 0 white, 0 -1px white; */
  font-family: sans;
  background-color: oklch(1 0 0 / 0.77);
  border-top-right-radius: 10px;
  color: black;
}

.key::after {
  content: '\00a0';
  /* Unicode representation of a non-breaking space nbsp */
}

.comma-separated-list {
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    display: inline;
  }

  li:not(:last-child)::after {
    content: ', ';
  }
}
</style>

<!-- construction_year, status, actors should be moved to keys.csv -->
<i18n lang="json">
{
  "en": {
    "about_the_receiving_project": "About the receiving project",
    "about_the_donor_site": "About the donor building",
    "about_the_reused_concrete": "About the reused concrete",
    "about_the_new_project": "About the new case-study",
    "more_information": "More information",
    "construction_year": "Construction year",
    "status": "Project status",
    "actors": "Actors",
    "case_study_actors": "Case study actors",
    "project_sheet_contributors": "Project sheet's contributors",
    "impact_source_tooltip": "Source",
    "cost_source_tooltip": "Source",
    "compared_to": "compared to",
    "credits": "credits"
  },
  "fr": {
    "about_the_receiving_project": "À propos du projet receveur",
    "about_the_donor_site": "À propos du site du donneur",
    "about_the_reused_concrete": "À propos du réemploi du béton",
    "about_the_new_project": "À propos du nouveau cas d'étude",
    "more_information": "Plus d'information",
    "construction_year": "Année de construction",
    "status": "État du projet",
    "actors": "Acteurs",
    "case_study_actors": "Acteurs de l'étude de cas",
    "project_sheet_contributors": "Contributeurs de la fiche projet",
    "impact_source_tooltip": "Source",
    "cost_source_tooltip": "Source",
    "compared_to": "comparé à",
    "credits": "crédits"
  }
}
</i18n>
