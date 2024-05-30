<template>
  <v-chart class="chart" :option="option" />
</template>

<script setup lang="ts">
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { BarChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from "echarts/components";
import VChart from "vue-echarts";

use([
  CanvasRenderer,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
]);

import { defineProps, computed } from 'vue'
import type { Project } from "@/types/Project";
import { useI18n } from "vue-i18n";
import type { ComponentItemTooltipLabelFormatterParams } from "echarts/types/src/util/types.js";
import { useProjectsStore } from "@/stores/projects";
import { storeToRefs } from "pinia";


const { t } = useI18n({ useScope: 'global' })
const projectsStore = storeToRefs(useProjectsStore())

const props = withDefaults(
  defineProps<{
    projects?: Project[]
  }>(),
  {
    projects: () => [],
  }
)

const projectsCount = computed<Record<string, number>>(() => 
  props.projects
    .map(x => x.receiver_country as string)
    .reduce((acc, country) =>
      (acc[country] = (acc[country] || 0) + 1, acc), {} as Record<string, number>)
  )

const grid = {
  left: 16,
  right: 10,
  top: 30,
  bottom: 10
};

const countriesISOAlphanumericOrder = projectsStore.countries.value.sort((a, b) => a.localeCompare(b)) as string[];
const option = computed(() => {

  const colors = [
    "#D64C48",
    "#F0662A",
    "#F08A6B",
    "#F09749",
    "#F0AC45",
    "#F0BF8F",
    "#F0D472",
    "#FAEAAB",
  ]
  const countriesISO = Object.keys(projectsCount.value).sort((a, b) => projectsCount.value[b] - projectsCount.value[a]) as string[];


  const series = countriesISO.map((countryISO) => {
      return {
        name: countryISO,
        type: 'bar',
        stack: 'total',
        barWidth: '100%',
        barHeight: '100%',
        itemStyle: {
          color: colors[countriesISOAlphanumericOrder.indexOf(countryISO) % colors.length],
        },
        label: {
          show: true,
          valueAnimation: true
        },
        data: [projectsCount.value[countryISO]],
      };
    });
  return {
  title: {
    text: `${props.projects.length} ${t('receiver_title', props.projects.length)}`,
    left: "8px", // todo align
    textStyle: {
      fontSize: 14,
      fontWeight: "bold",
    }
  },
  tooltip: {
    trigger: "item",
    formatter: (params: ComponentItemTooltipLabelFormatterParams) => {
      return `${t('receiver_country')} <br/> ${t('countryFn', [params.seriesName])}: ${params.value} `
    }
  },
  legend: {
    show: false,
  },
  grid,
  xAxis: {
    type: 'value',
    axisLabel: false,
  },
  yAxis: {
    type: 'category',
    data: ['Country'],
    axisLabel: false,
  },
  series
}
});
</script>

<style scoped>
.chart {
  height: 100%;
}
</style>