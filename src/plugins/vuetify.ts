import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'
import colors from 'vuetify/lib/util/colors'
import 'vuetify/styles'
import { useCookies } from 'vue3-cookies'

// Translations provided by Vuetify
import { en, fr } from 'vuetify/locale'

const { cookies } = useCookies()
const locale = cookies.get('locale')

export default createVuetify({
  locale: {
    locale: locale,
    fallback: 'en',
    messages: { en, fr },
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi
    }
  },
  theme: {
    themes: {
      light: {
        colors: {
          primary: colors.shades.black,
          secondary: colors.blue.base
        }
      }
    }
  }
})
