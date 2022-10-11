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
  },
  saveCurrentAlbum(state, album) {
    state.profile.album = album
    localstorage.saveProfile(state.profile)
  },
  saveAlbumImages(state, images) {
    state.profile.albumImages = images
    localstorage.saveProfile(state.profile)
  },
  saveAlbumEndReached(state, endReached) {
    state.profile.endReached = endReached
    localstorage.saveProfile(state.profile)
  }
}
  