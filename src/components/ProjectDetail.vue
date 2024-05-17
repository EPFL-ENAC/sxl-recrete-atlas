<template>
  <v-card>
    <v-card-item :prepend-icon="mdiDomain">
      <v-card-title>{{ props.project[`name_${locale as ProjectLang}`] }}</v-card-title>
    </v-card-item>
    <v-card-item>

      <v-card-text>
      <v-row>
        <v-col :cols="6">
          <v-row>
            <b class="key">{{ $t(`description_${locale as ProjectLang}`) }}: </b> {{ props.project[`description_${locale as ProjectLang}`] }}
          </v-row>
          <v-row>
            <b class="key">{{ $t("receiver_country") }} ({{ $t("receiver_city") }}): </b> {{props.project.receiver_country }} ({{ props.project.receiver_city }})
          </v-row>
          <v-row>
            <b class="key">{{ $t("start_date_year") }}: </b> {{ props.project.start_date_year }}
          </v-row>
          <v-row>
            <b class="key">{{ t("status") }}:</b> {{ props.project.status ?? $t("unknown") }}
          </v-row>
        </v-col>
        <v-col :cols="6">
          <v-carousel v-if="(props.project.images?.length ?? 0) > 0" height="100%" :show-arrows="false"  :interval="3000">
            <v-carousel-item v-for="(image, $key) in props.project.images" :key="$key" :src="image"  content-class="carousel-content"  cover height="300px">

                <v-card-title class="image-title">{{ props.project[`name_${locale as ProjectLang}`] }}</v-card-title>
            </v-carousel-item>
          </v-carousel>
          <v-img v-else class="align-end text-white" cover height="300px" :src="`${defaultImage}`">
            <v-card-title class="image-title">{{ props.project[`name_${locale as ProjectLang}`] }}</v-card-title>
          </v-img>
        </v-col>
      </v-row>
      <v-row>
        <v-col :cols="3">
          <v-row>
            <h3 class="text-decoration-underline">{{ t("about_the_donor_site") }}</h3>
          </v-row>
          <v-row>
            <b class="key">{{ $t("distance_km") }}:</b> {{ props.project.distance_km }}
          </v-row>
          <v-row>
            <b class="key">{{ $t("donor_use") }}:</b> {{ props.project.donor_use }}
          </v-row>
          <v-row>
            <b class="key">{{ t("construction_year") }}:</b> {{ project_construction_year }}
          </v-row>
        </v-col>
        <v-col :cols="3">
          <v-row>
            <h3 class="text-decoration-underline">{{ t("about_the_reused_concrete") }}</h3>
          </v-row>
          <v-row>
            <b class="key">{{ $t("quantity_reclaimed") }}:</b> {{ props.project.quantity_reclaimed }} ({{  props.project.quantity_reclaimed_unit }})
          </v-row>
          <!-- TODO: find out why we don't display nb floor -->
          <!-- <v-row>
            <b>{{ $t("donor_nb_floor") }}:</b> 
            
            <span v-if="props.project.donor_nb_floor">
              {{ props.project.donor_nb_floor_smaller }} &LessSlantEqual; x &LessSlantEqual; {{ props.project.donor_nb_floor }}</span>
            <span v-else>{{ props.project.donor_nb_floor }}</span>
          </v-row> -->

          <v-row>
            <b class="key">{{ $t("donor_element_type") }}:</b> {{ props.project.donor_element_type }}
          </v-row>
          <v-row>
            <b class="key">{{ $t("receiver_element_type") }}:</b> {{ props.project.receiver_element_type }}
          </v-row>
          <v-row>
            <b class="key">{{ $t("component_age") }}:</b> {{ props.project.component_age }}
          </v-row>

          <v-row>
            <!-- TODO: CIP for instance: use equivalent Cast in Place text for i18n-->
            <b class="key">{{ $t("receiver_use") }}:</b>
            <i v-if="props.project.main_concrete_type_uncertainty">
              {{ props.project.main_concrete_type }}
            </i>
            <span v-else>{{ props.project.main_concrete_type }}</span>
          </v-row>
        </v-col>
        <v-col :cols="3">
          <v-row>
            <h3 class="text-decoration-underline">{{ t("about_the_new_project") }}</h3>
          </v-row>
          <v-row>
            <b class="key">{{ $t("impact_design_alternative") }}:</b> {{ props.project.impact_difference }}
            {{ props.project.impact_unit }}
            {{  t("compared_to") }} {{ props.project.cost_design_alternative }}
            <v-tooltip text="Tooltip">
                <template #activator="{ props }">
                  <v-icon  v-bind="props">{{ mdiInformationBoxOutline }} props</v-icon>
                </template>
                <span>{{ t("impact_source_tooltip") }}: {{ props.project.impact_source }}</span>
              </v-tooltip>
          </v-row>

          <v-row>
            <b class="key">{{ $t("cost_difference_max_percent") }}:</b> {{ props.project.cost_difference_max_percent }} %
            {{  t("compared_to") }} {{ props.project.cost_design_alternative }}
            <v-tooltip text="Tooltip">
                <template #activator="{ props }">
                  <v-icon  v-bind="props">{{ mdiInformationBoxOutline }} props</v-icon>
                </template>
                <span>{{ t("cost_source_tooltip") }}: {{ props.project.cost_source }}</span>
              </v-tooltip>
          </v-row>

          <v-row v-if="$props.project.other">
            <b class="key">{{ $t("other") }}:</b> {{ props.project.other }}
          </v-row>

          <v-row>
            <b class="key">{{ t("actors") }}:</b> {{ props.project.actors?.join(',') ?? $t("unknown") }}
          </v-row>

        </v-col>
        <v-col :cols="3">
          <v-row>
            <h3 class="text-decoration-underline">{{ t("more_information") }}</h3>
          </v-row>
          <v-row>
            <b class="key">{{ $t("reference") }}:</b> {{ props.project.reference }}
          </v-row>
        </v-col>
      </v-row>


    </v-card-text>
    </v-card-item>
    <template #actions>
      <v-btn class="ml-auto" text="Close" @click="closeDialog"></v-btn>
    </template>
  </v-card>
</template>

<script setup lang="ts">
import { mdiDomain, mdiInformationBoxOutline } from '@mdi/js';
import { computed, defineModel } from 'vue';
import { defaultImage } from '@/utils/default';
import type { Project, ProjectLang } from '@/types/Project';
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router';
const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()

const isDialogActive = defineModel({
  type: Boolean,
  default: false,
})

const props = defineProps<{
  project: Project
}>()



const projectId = computed({
  get() {
    return route.query.projectId ?? ''
  },
  set(projectId) {
    router.replace({query: {...route.query, projectId: projectId === '' ? undefined : projectId } })
  }
})

const closeDialog = () => {
  isDialogActive.value = false
  projectId.value = '';
}

const project_construction_year = computed(() => {
  return new Date().getFullYear() - (props?.project.component_age ?? 0);
})
</script>

<style scoped>
:deep(.carousel-content) {
  justify-content: flex-start;
  align-items: end;
  display: flex;
}
.image-title {
    /* text-shadow: -1px 0 white, 0 1px white, 1px 0 white, 0 -1px white; */
    font-family: sans;
    background-color: oklch(1 0 0 / 0.77);
    border-top-right-radius: 10px;
    color: black;
}

.key::after {
  content: '\00a0'; /* Unicode representation of a non-breaking space nbsp */
}
</style>

<!-- construction_year, status, actors should be moved to keys.csv -->
<i18n lang="json">
{
  "en": {
    "about_the_donor_site": "About the donor site",
    "about_the_reused_concrete": "About the reused concrete",
    "about_the_new_project": "About the new project",
    "more_information": "More information",
    "construction_year": "Construction year",
    "status": "Project status",
    "actors": "Actors",
    "impact_source_tooltip": "Source",
    "cost_source_tooltip": "Source",
    "compared_to": "compared to"
  },
  "fr": {
    "about_the_donor_site": "À propos du site du donneur",
    "about_the_reused_concrete": "À propos du réemploi du béton",
    "about_the_new_project": "À propos du nouveau project",
    "more_information": "plus d'information",
    "construction_year": "Année de construction",
    "status": "État du projet",
    "actors": "Acteurs",
    "impact_source_tooltip": "Source",
    "cost_source_tooltip": "Source",
    "compared_to": "comparé à"
  }
}
</i18n>
