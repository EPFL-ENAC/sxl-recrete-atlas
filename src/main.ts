import App from '@/App.vue'
import vuetify from '@/plugins/vuetify'
import i18n from '@/plugins/i18n'
import router from '@/router'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import FloatingVue from 'floating-vue'

import './assets/main.css'
import 'floating-vue/dist/style.css'

const app = createApp(App)

app.use(FloatingVue)
app.use(createPinia())
app.use(router)
app.use(vuetify)
app.use(i18n)

app.mount('#app')
