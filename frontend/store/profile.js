import Vue from "vue";
import localstorage from "~/assets/js/localstorage";

export const state = () => ({
  profile: null
})

export const mutations = {
  save(state, obj) {
    state.profile = obj  
  },
  saveAPIKey(state, apikey) {
    state.profile = {}
    state.profile.apikey = apikey
    localstorage.saveProfile(state.profile)
  }
}
  