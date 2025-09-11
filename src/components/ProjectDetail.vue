<template>
  <v-card v-if="props.project" class="project-detail-card">
    <v-card-item class="project-title-border">
      <v-card-title class="d-flex justify-center align-center">
        <p class="d-flex justify-center" style="width: 100%">
          <span class="font-weight-bold">{{ props.project[`name_${locale as ProjectLang}`] }}</span>
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
    <v-card-item>
      <v-card-text>
        <v-row class="mb-4">
          <v-col :cols="12">
            <v-carousel
              v-if="(props.project.images?.length ?? 0) > 0"
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
                      (carouselIndex - 1 + (props.project.images?.length ?? 0)) %
                      (props.project.images?.length ?? 1)
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
                    carouselIndex = (carouselIndex + 1) % (props.project.images?.length ?? 1)
                  "
                ></v-btn>
              </template>
              <v-carousel-item
                v-for="(image, $key) in props.project.images"
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
                  v-if="props.project?.images_credits?.length ?? 0 > 0"
                  class="d-flex justify-center font-italic"
                >
                  {{ t('credits') }}:
                  {{ props.project?.images_credits?.[carouselIndex] }}
                </span>
              </v-card-subtitle>
            </v-card-title>
          </v-col>
        </v-row>
        <v-row class="ga-3 mb-4">
          <v-col :cols="6">
            <v-row class="mb-4">
              <section>
                <h3 class="text-font-bold">{{ $t(`description_${locale as ProjectLang}`) }}</h3>
                <p>{{ props.project[`description_${locale as ProjectLang}`] }}</p>
              </section>
            </v-row>

            <v-row>
              <h3 class="text-font-bold">{{ t('about_the_receiving_project') }}</h3>
            </v-row>
            <v-row>
              <span class="key"
                >{{ t('about_receiving_country') }}
                <span v-if="props.project.receiver_city">({{ t('about_receiving_city') }})</span>
                :
              </span>
              <span
                >{{ $t('countryFn', [props.project.receiver_country]) }}
                <span v-if="props.project.receiver_city">
                  ({{ props.project.receiver_city }})
                </span>
              </span>
            </v-row>
            <v-row>
              <span class="key">{{ t('about_receiving_date') }}: </span>
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
        </v-row>
        <v-row class="">
          <v-col
            v-if="
              props.project.distance_km ||
              (props.project.donor_use?.length ?? 0) > 0 ||
              project_construction_year > 0
            "
            :sm="12"
            :md="6"
            :lg="3"
            :cols="3"
          >
            <v-row>
              <v-col>
                <v-row>
                  <h3 class="text-font-bold">{{ t('about_the_donor_site') }}</h3>
                </v-row>
                <v-row v-if="props.project.distance_km">
                  <span class="key">{{ $t('distance_km') }}:</span>

                  <i v-if="props.project.distance_uncertainty">
                    {{ props.project.distance_km }}
                  </i>
                  <span v-else>{{ props.project.distance_km }}</span>
                </v-row>
                <v-row v-if="(props.project.donor_use?.length ?? 0) > 0">
                  <span class="key">{{ $t('donor_use') }}:</span>
                  {{ props.project.donor_use?.join(', ') }}
                </v-row>
                <v-row v-if="project_construction_year > 0">
                  <span class="key">{{ t('construction_year') }}:</span>
                  <i v-if="props.project.age_uncertainty || props.project.date_uncertainty">
                    {{ project_construction_year }}
                  </i>
                  <span v-else>{{ project_construction_year }}</span>
                </v-row>
              </v-col>
            </v-row>
          </v-col>
          <v-col
            v-if="
              props.project.quantity_reclaimed ||
              (props.project.donor_element_type?.length ?? 0) > 0 ||
              (props.project.receiver_element_type?.length ?? 0) > 0 ||
              props.project.component_age
            "
            :sm="12"
            :md="6"
            :lg="3"
            :cols="3"
          >
            <v-row>
              <h3 class="text-font-bold">{{ t('about_the_reused_concrete') }}</h3>
            </v-row>
            <v-row v-if="props.project.quantity_reclaimed">
              <span class="key">{{ $t('quantity_reclaimed') }}:</span>
              {{ props.project.quantity_reclaimed }} ({{ props.project.quantity_reclaimed_unit }})
            </v-row>

            <v-row v-if="(props.project.donor_element_type?.length ?? 0) > 0">
              <span class="key">{{ $t('donor_element_type') }}:</span>
              {{ props.project.donor_element_type?.join(', ') }}
            </v-row>
            <v-row v-if="(props.project.receiver_element_type?.length ?? 0) > 0">
              <span class="key">{{ $t('receiver_element_type') }}:</span>
              {{ props.project.receiver_element_type?.join(', ') }}
            </v-row>
            <v-row v-if="props.project.component_age">
              <span class="key">{{ $t('component_age') }}:</span>
              <i v-if="props.project.age_uncertainty">
                {{ props.project.component_age }}
              </i>
              <span v-else>{{ props.project.component_age }}</span>
            </v-row>

            <v-row>
              <!-- TODO: CIP for instance: use equivalent Cast in Place text for i18n-->
              <span class="key">{{ $t('main_concrete_type') }}:</span>
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
            :sm="12"
            :md="12"
            :lg="3"
            :cols="3"
          >
            <v-row>
              <h3 class="text-font-bold">{{ t('about_the_new_case_study') }}</h3>
            </v-row>
            <v-row v-if="props.project.impact_difference">
              <span class="key">{{ $t('impact_design_alternative') }}:</span>
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
              <span class="key">{{ $t('cost_difference_max_percent') }}:</span>
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
              <span class="key">{{ $t('other') }}:</span> {{ props.project.other }}
            </v-row>
          </v-col>
          <v-col :sm="12" :md="6" :lg="3" :cols="3">
            <v-row>
              <h3 class="text-font-bold">{{ t('more_information') }}</h3>
            </v-row>
            <v-row>
              <span class="key">{{ $t('reference') }}:</span>
              {{ props.project.reference?.join(', ') }}
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
              <span class="key">{{ t('case_study_actors') }}:</span>
              {{ props.project.actors?.join(', ') ?? $t('unknown') }}
            </v-row>
            <v-row v-if="(props.project.fact_sheet_contributors?.length ?? 0) > 0">
              <span class="key">{{ t('fact_sheet_contributors') }}:</span>
              {{ props.project.fact_sheet_contributors?.join(', ') ?? $t('unknown') }}
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
        {{ t('project_sheet_contributors') }}:
        {{
          Array.isArray(props.project.fact_sheet_contributors)
            ? props.project.fact_sheet_contributors.join(', ')
            : props.project.fact_sheet_contributors || $t('unknown')
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
    "fact_sheet_contributors": "Fact sheet contributors"
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
