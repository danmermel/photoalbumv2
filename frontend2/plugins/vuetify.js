// plugins/vuetify.js
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

// export default defineNuxtPlugin(nuxtApp => {
//   const vuetify = createVuetify({
//     ssr: false,
//     components,
//     directives,
//   })

//   nuxtApp.vueApp.use(vuetify)
// })

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    ssr: false,
    components,
    directives,
    icons: {
      defaultSet: 'mdi',

    },
  })
  nuxtApp.vueApp.use(vuetify)
})
