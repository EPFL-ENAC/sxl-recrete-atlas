<template>
  <ul>
              <li v-for="(refe, key) in item?.reference" :key="key">
                
                <span  v-if="referencesMap[refe].url" >

                  [{{ refe }}]: <a target="_blank" :href="referencesMap[refe].url">
                    
                   {{ referencesMap[refe].text }}
                  
                  </a>
                </span>
                <span v-else>
                  [{{ refe }}]: {{ referencesMap[refe].text }}
                </span>
              </li>
            </ul>
</template>

<script setup lang="ts">
import { useReferencesStore } from '@/stores/references'
import { storeToRefs } from 'pinia';
import { defineProps } from 'vue'
defineProps({
  item: {
    type: Object,
    required: true
  }
})

const referencesMap = storeToRefs(useReferencesStore()).referencesMap



</script>

<style scoped lang="scss">
ul {
  list-style: lower-latin;
  li {
    margin-bottom: 0.5rem;
    &:last-child {
      margin-bottom: 0;
    }
  }
}
</style>