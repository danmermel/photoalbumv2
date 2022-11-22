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
  },
  saveMode(state, mode) {
    state.profile.mode = mode
    localstorage.saveProfile(state.profile)
  },
  saveLastEvaluatedKey(state, lastEvaluatedKey) {
    state.profile.lastEvaluatedKey = lastEvaluatedKey
    localstorage.saveProfile(state.profile)
  }
}
  