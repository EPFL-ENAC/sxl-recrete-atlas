import { defineStore } from 'pinia'
import { ref } from 'vue'
import referencesJson from '@/assets/data/references.json'

export interface Reference {
  key: string
  text: string
  url: string
}

export type ReferenceMap = Record<string, Omit<Reference, 'key'>>
export const useReferencesStore = defineStore('references', () => {
  const references = ref<Reference[]>(referencesJson)
  const referencesMap = ref<ReferenceMap>(
    referencesJson.reduce((acc: Record<string, Reference>, reference: Reference) => {
      acc[reference.key] = reference
      return acc
    }, {})
  )

  return { references, referencesMap }
})
