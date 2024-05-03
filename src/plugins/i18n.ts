import { createI18n } from 'vue-i18n'
import { useCookies } from 'vue3-cookies'

import en from '@/locales/en.json'
import fr from '@/locales/fr.json'
import keys from '@/assets/data/keys.json'
import type { Key } from '@/types/Filter'

const { cookies } = useCookies()
const locale = cookies.get('locale')

type LangKeys = Record<string, string>;
const enKeys = (keys as Key[]).reduce(
  (acc: LangKeys, filter: Key) => {
    acc[filter.key] = filter.english 
    return acc;
}, {})

const frKeys = (keys as Key[]).reduce(
  (acc: LangKeys, filter: Key) => {
    acc[filter.key] = filter.french 
    return acc;
}, {})

export default createI18n({
  locale: locale ?? 'en',
  fallbackLocale: 'en',
  messages: {
    en: {...en, ...enKeys },
    fr: {...fr, ...frKeys },
  },
  legacy: false
})
