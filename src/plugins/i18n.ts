import { createI18n } from 'vue-i18n'
import { useCookies } from 'vue3-cookies'

import en from '@/locales/en.json'
import fr from '@/locales/fr.json'

const { cookies } = useCookies()
const locale = cookies.get('locale')

export default createI18n({
  locale: locale ?? 'en',
  fallbackLocale: 'en',
  messages: {
    en,
    fr
  },
  legacy: false
})
