<script setup lang="ts">
import JsonWebMap from '@/components/JsonWebMap.vue'
import { useConfigurationStore } from '@/stores/configuration'

const { parametersUrl, styleUrl, cdnUrl, martinUrl } = useConfigurationStore()
</script>

<template>
  <JsonWebMap :parameters-url="parametersUrl" :style-url="styleUrl" :cdn-url="cdnUrl" :martin-url="martinUrl" />
</template>
