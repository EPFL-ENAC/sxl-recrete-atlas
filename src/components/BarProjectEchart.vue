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


const { t } = useI18n({ useScope: 'global' })

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
  left: 10,
  right: 10,
  top: 30,
  bottom: 10
};

const option = computed(() => {


  const countriesISO = Object.keys(projectsCount.value);


  const series = countriesISO.map((countryISO) => {
      return {
        name: countryISO,
        type: 'bar',
        stack: 'total',
        barWidth: '100%',
        barHeight: '100%',
        label: {
          show: true,
        },
        data: [projectsCount.value[countryISO]],
      };
    });
  return {
  title: {
    text: `${props.projects.length} ${t('receiver_title', props.projects.length)}`,
    left: "center"
  },
  tooltip: {
    trigger: "item",
    formatter: (params: ComponentItemTooltipLabelFormatterParams) => {
      console.log(params)
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