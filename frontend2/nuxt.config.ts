// https://nuxt.com/docs/api/configuration/nuxt-config

import config from "./config.json"

export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },

  runtimeConfig: {
 
    public: config
    
  },

  css: [
    'vuetify/lib/styles/main.sass',
    "@mdi/font/css/materialdesignicons.css",
    '/assets/global.css'
  ],

  build: {
    transpile: ['vuetify']
  },
  ssr: false  // static website mode ssr= server-side rendering

})



