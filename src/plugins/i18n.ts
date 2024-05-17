import { createI18n } from 'vue-i18n'
import { useCookies } from 'vue3-cookies'

import en from '@/locales/en.json'
import fr from '@/locales/fr.json'
import keys from '@/assets/data/keys.json'
import project_values from '@/assets/data/project_values.json'
import countries from "@/assets/data/countries.json"
import type { Key } from '@/types/Filter'

const { cookies } = useCookies()
const locale = cookies.get('locale')

type LangKeys = Record<string, string>;
const enKeys = (keys as Key[]).reduce(
  (acc: LangKeys, filter: Key) => {
    acc[filter.key] = filter.english
    acc[`project_${filter.key}`] = filter.english 
    return acc;
}, {})

const frKeys = (keys as Key[]).reduce(
  (acc: LangKeys, filter: Key) => {
    acc[filter.key] = filter.french
    acc[`project_${filter.key}`] = filter.french // project_ prefix for project filters
    return acc;
}, {})


// project_values
const projectValuesKeysEn = (project_values as Key[]).reduce(
  (acc: LangKeys, filter: Key) => {
    acc[filter.key] = filter.english
    return acc;
}, {})

const projectValuesKeysFr = (project_values as Key[]).reduce(
  (acc: LangKeys, filter: Key) => {
    acc[filter.key] = filter.french
    return acc;
}, {})

// countries
const countriesEn = (countries as Key[]).reduce(
  (acc: LangKeys, filter: Key) => {
    acc[filter.key] = filter.english
    return acc;
}, {})

const countriesFr = (countries as Key[]).reduce(
  (acc: LangKeys, filter: Key) => {
    acc[filter.key] = filter.french
    return acc;
}, {})


export default createI18n({
  locale: locale ?? 'en',
  fallbackLocale: 'en',
  messages: {
    en: {...projectValuesKeysEn,...en, ...enKeys, ...countriesEn  },
    fr: {...projectValuesKeysFr, ...fr, ...frKeys, ...countriesFr },
  },
  legacy: false
})
