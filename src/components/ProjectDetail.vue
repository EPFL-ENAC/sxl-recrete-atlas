<template>
  <v-card v-if="project" class="project-detail-card">
    <v-card-item class="project-detail__title project-title-border">
      <v-card-title class="d-flex justify-center align-center">
        <p class="d-flex justify-center" style="width: 100%">
          <span class="font-weight-bold">{{ project[`name_${locale as ProjectLang}`] }}</span>
        </p>
        <v-btn
          variant="plain"
          size="small"
          :icon="mdiClose"
          class="ml-auto"
          text="Close"
          @click="closeDialog"
        ></v-btn>
      </v-card-title>
    </v-card-item>
    <v-card-item class="project-detail__card">
      <v-card-text>
        <div class="project-detail-grid">
          <div class="grid-full-width">
            <v-carousel
              v-if="(project.images?.length ?? 0) > 0"
              v-model="carouselIndex"
              height="512px"
              variant="plain"
              :show-arrows="true"
              :hide-delimiter-background="true"
              :hide-delimiters="true"
              :interval="3000"
            >
              <template #prev>
                <v-btn
                  variant="plain"
                  class="carousel-icon"
                  aria-label="Previous image"
                  :icon="mdiChevronLeft"
                  @click.stop="
                    carouselIndex =
                      (carouselIndex - 1 + (project.images?.length ?? 0)) %
                      (project.images?.length ?? 1)
                  "
                ></v-btn>
              </template>
              <template #next>
                <v-btn
                  variant="plain"
                  class="carousel-icon"
                  aria-label="Next image"
                  :icon="mdiChevronRight"
                  @click.stop="
                    carouselIndex = (carouselIndex + 1) % (project.images?.length ?? 1)
                  "
                ></v-btn>
              </template>
              <v-carousel-item
                v-for="(image, $key) in project.images"
                :key="$key"
                :src="image"
                content-class="carousel-content"
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
              <v-card-subtitle style="width: 100%" class="d-flex justify-center flex-column">
                <span
                  v-if="project?.images_credits?.length ?? 0 > 0"
                  class="d-flex justify-center font-italic"
                >
                  {{ t('credits') }}:
                  {{ project?.images_credits?.[carouselIndex] }}
                </span>
              </v-card-subtitle>
            </v-card-title>
          </div>
          
          <div class="grid-full-width">
            <section>
              <h3 class="text-font-bold">{{ $t(`description_${locale as ProjectLang}`) }}</h3>
              <p>{{ project[`description_${locale as ProjectLang}`] }}</p>
            </section>
          </div>

          <section 
            v-if="
              project.distance_km ||
              (project.donor_use?.length ?? 0) > 0 ||
              project_construction_year > 0
            "
            class="grid-section"
          >
            <h3 class="text-font-bold">{{ t('about_the_donor_site') }}</h3>
            <div v-if="project.distance_km" class="detail-row">
              <span class="key">{{ $t('distance_km') }}:</span>
              <i v-if="project.distance_uncertainty">
                {{ project.distance_km }}
              </i>
              <span v-else>{{ project.distance_km }}</span>
            </div>
            <div v-if="(project.donor_use?.length ?? 0) > 0" class="detail-row">
              <span class="key">{{ $t('donor_use') }}:</span>
              {{ project.donor_use?.join(', ') }}
            </div>
            <div v-if="project_construction_year > 0" class="detail-row">
              <span class="key">{{ t('construction_year') }}:</span>
              <i v-if="project.age_uncertainty || project.date_uncertainty">
                {{ project_construction_year }}
              </i>
              <span v-else>{{ project_construction_year }}</span>
            </div>
          </section>
          
          <section 
            v-if="
              project.quantity_reclaimed ||
              (project.donor_element_type?.length ?? 0) > 0 ||
              (project.receiver_element_type?.length ?? 0) > 0 ||
              project.component_age
            "
            class="grid-section"
          >
            <h3 class="text-font-bold">{{ t('about_the_reused_concrete') }}</h3>
            <div v-if="project.quantity_reclaimed" class="detail-row">
              <span class="key">{{ $t('quantity_reclaimed') }}:</span>
              {{ project.quantity_reclaimed }} ({{ project.quantity_reclaimed_unit }})
            </div>

            <div v-if="(project.donor_element_type?.length ?? 0) > 0" class="detail-row">
              <span class="key">{{ $t('donor_element_type') }}:</span>
              {{ project.donor_element_type?.join(', ') }}
            </div>
            <div v-if="(project.receiver_element_type?.length ?? 0) > 0" class="detail-row">
              <span class="key">{{ $t('receiver_element_type') }}:</span>
              {{ project.receiver_element_type?.join(', ') }}
            </div>
            <div v-if="project.component_age" class="detail-row">
              <span class="key">{{ $t('component_age') }}:</span>
              <i v-if="project.age_uncertainty">
                {{ project.component_age }}
              </i>
              <span v-else>{{ project.component_age }}</span>
            </div>

            <div class="detail-row">
              <!-- TODO: CIP for instance: use equivalent Cast in Place text for i18n-->
              <span class="key">{{ $t('main_concrete_type') }}:</span>
              <ul class="comma-separated-list">
                <li v-for="(concrete_type, $key) in project.main_concrete_type" :key="$key">
                  <span
                    :class="{
                      'font-italic': project?.main_concrete_type_uncertainty?.[$key],
                      'text-grey': project?.main_concrete_type_uncertainty?.[$key]
                    }"
                    >{{ $t(concrete_type) }}</span
                  >
                </li>
              </ul>
            </div>
          </section>
          
          <section 
            v-if="
              project.impact_difference ||
              project.cost_difference_max_percent ||
              project?.other
            "
            class="grid-section"
          >
            <h3 class="text-font-bold">{{ t('about_the_new_case_study') }}</h3>
            <div v-if="project.impact_difference" class="detail-row">
              <span class="key">{{ $t('impact_design_alternative') }}:</span>
              {{ project.impact_difference }}
              {{ t('compared_to') }} {{ project.cost_design_alternative }}
              <v-tooltip v-if="project.impact_source" text="Tooltip">
                <template #activator="{ props: activatorProps }">
                  <v-icon v-bind="activatorProps">{{ mdiInformationBoxOutline }} props</v-icon>
                </template>
                <span>{{ t('impact_source_tooltip') }}: {{ project.impact_source }}</span>
              </v-tooltip>
            </div>

            <div v-if="project.cost_difference_max_percent" class="detail-row">
              <span class="key">{{ $t('cost_difference_max_percent') }}:</span>
              {{ project.cost_difference_max_percent }} % {{ t('compared_to') }}
              {{ project.cost_design_alternative }}
              <v-tooltip v-if="project.cost_source" text="Tooltip">
                <template #activator="{ props: propsActivator }">
                  <v-icon v-bind="propsActivator">{{ mdiInformationBoxOutline }} props</v-icon>
                </template>
                <span>{{ t('cost_source_tooltip') }}: {{ project.cost_source }}</span>
              </v-tooltip>
            </div>

            <div v-if="project?.other" class="detail-row">
              <span class="key">{{ $t('other') }}:</span> {{ project.other }}
            </div>
          </section>
          
          <section class="grid-section">
            <h3 class="text-font-bold">{{ t('more_information') }}</h3>
            <div class="detail-row">
              <span class="key">{{ $t('reference') }}:</span>
              {{ project.reference?.join(', ') }}
              <VDropdown :distance="6" popper-class="popper-class" :placement="'top-end'">
                <!-- This will be the popover reference (for the events and position) -->
                <button>
                  <v-icon :icon="mdiInformationSlabCircle"></v-icon>
                </button>

                <!-- This will be the content of the popover -->
                <template #popper>
                  <ReferenceList :item="project" />
                </template>
              </VDropdown>
            </div>
            <div v-if="(project.actors?.length ?? 0) > 0" class="detail-row">
              <span class="key">{{ t('case_study_actors') }}:</span>
              {{ project.actors?.join(', ') ?? $t('unknown') }}
            </div>
            <div v-if="(project.fact_sheet_contributors?.length ?? 0) > 0" class="detail-row">
              <span class="key">{{ t('fact_sheet_contributors') }}:</span>
              {{ project.fact_sheet_contributors?.join(', ') ?? $t('unknown') }}
            </div>
          </section>
          
          <section class="grid-full-width receiving-project-section">
            <h3 class="text-font-bold">{{ t('about_the_receiving_project') }}</h3>
            <div class="detail-row">
              <span class="key"
                >{{ t('about_receiving_country') }}
                <span v-if="project.receiver_city">({{ t('about_receiving_city') }})</span>
                :
              </span>
              <span
                >{{ $t('countryFn', [project.receiver_country]) }}
                <span v-if="project.receiver_city">
                  ({{ project.receiver_city }})
                </span>
              </span>
            </div>
            <div class="detail-row">
              <span class="key">{{ t('about_receiving_date') }}: </span>
              <span
                :class="{
                  'font-italic': project.date_uncertainty,
                  'text-grey': project.date_uncertainty
                }"
              >
                {{ project.start_date_year }}
              </span>
            </div>
          </section>
        </div>
      </v-card-text>
    </v-card-item>
    <template #actions>
      <div
        v-if="project?.fact_sheet_contributors"
        class="text-grey text-caption text-right mt-4"
      >
        {{ t('project_sheet_contributors') }}:
        {{
          Array.isArray(project.fact_sheet_contributors)
            ? project.fact_sheet_contributors.join(', ')
            : project.fact_sheet_contributors || $t('unknown')
        }}
      </div>
    </template>
  </v-card>
</template>

<script setup lang="ts">
import {
  mdiClose,
  mdiInformationBoxOutline,
  mdiInformationSlabCircle,
  mdiChevronLeft,
  mdiChevronRight
} from '@mdi/js'
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
.project-title-border {
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  &:deep(.v-card-title) {
    padding: 0.5rem 1rem;
    font-size: 1.25rem;
    font-weight: bold;
    text-wrap-mode: wrap;
  }
}

:deep(.carousel-content) {
  justify-content: flex-start;
  align-items: end;
  display: flex;
}

.project-detail-card {
  justify-content: space-between;
}
.project-detail__title {
  background-color: oklch(0.95 0.1 270 / 1);
  position: sticky;
  top: 0;
  z-index: 1;
  flex-shrink: 0;
  background-color: white;
}

.project-detail__card {
  padding: 1rem 2rem 2rem 2rem;
}

@media screen and (max-width: 600px) {
  :deep(.v-card-item.project-detail__card) {
    padding: 0rem !important;
  }
}
.project-detail-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}

.grid-full-width {
  grid-column: 1 / -1;
}

.grid-section {
  padding: 1rem;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 4px;
}

.detail-row {
  margin-bottom: 0.75rem;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.receiving-project-section {
  background-color: oklch(0.95 0.1 270 / 1);
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 4px;
  padding: 1rem;
}

@media screen and (max-width: 1200px) {
  .project-detail-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media screen and (max-width: 600px) {
  .project-detail-grid {
    grid-template-columns: 1fr;
  }
  
  .grid-section {
    padding: 0.75rem;
  }
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
    "about_the_new_case_study": "About the new case-study",
    "more_information": "More information",
    "construction_year": "Construction year",
    "status": "Project status",
    "actors": "Actors",
    "case_study_actors": "Case study actors",
    "project_sheet_contributors": "Project sheet's contributors",
    "impact_source_tooltip": "Source",
    "cost_source_tooltip": "Source",
    "compared_to": "compared to",
    "credits": "credits",
    "about_receiving_country": "Country",
    "about_receiving_city": "city",
    "about_receiving_date": "Date of Construction start",
    "fact_sheet_contributors": "Factsheet contributors"
  },
  "fr": {
    "about_the_receiving_project": "À propos du projet receveur",
    "about_the_donor_site": "À propos du site du donneur",
    "about_the_reused_concrete": "À propos du réemploi du béton",
    "about_the_new_case_study": "À propos du nouveau cas d'étude",
    "more_information": "Plus d'information",
    "construction_year": "Année de construction",
    "status": "État du projet",
    "actors": "Acteurs",
    "case_study_actors": "Acteurs de l'étude de cas",
    "project_sheet_contributors": "Contributeurs de la fiche projet",
    "impact_source_tooltip": "Source",
    "cost_source_tooltip": "Source",
    "compared_to": "comparé à",
    "credits": "crédits",
    "about_receiving_country": "Pays",
    "about_receiving_city": "ville",
    "about_receiving_date": "Date de début de construction",
    "fact_sheet_contributors": "Contributeurs de la fiche projet"
  }
}
</i18n>
