<template>
  <div>
    <v-container>
      <v-layout row wrap>
        <v-flex xs6 md3 mb-1 px-1 v-for="album in albums" :key="album" >
          <v-card color="blue darken-1" height="100px" :href="`/album/${album}`" nuxt>
            <v-card-title class="justify-center">{{ album }}</v-card-title>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
    <v-text-field
      v-model="newAlbumName"
      label="New Album name"
      required
    ></v-text-field>
    <v-btn :disabled="buttonDisable" @click="createAlbum">Create</v-btn>
  </div>
</template>

<script>
const config = require("../config.json");
export default {
  data: function () {
    return {
      albums: [],
      newAlbumName: "",
      buttonDisable:false
    };
  },
  async asyncData({ redirect, store, $axios }) {
    // load recent article list from local storage (profile)
    const profile = store.state.profile.profile;
    if (!profile) {
      //not logged in so bounce to home page
      redirect("/");
      return;
    }

    // fetch albums from the API
    store.commit("profile/saveMode", "albumlist");
    const url = `${config.listAlbumsAPIFunctionUrl.value}?apikey=${profile.apikey}`;
    const response = await $axios.$get(url);
    return { albums: response.albums };
  },
  methods: {
    createAlbum: async function () {
      this.buttonDisable = true
      const profile = this.$store.state.profile.profile;
      const url = `${config.createAlbumAPIFunctionUrl.value}?apikey=${profile.apikey}&album=${this.newAlbumName}`;
      try {
        const response = await this.$axios.$get(url);
        this.$store.commit("alert/insertAlert", {
          alertMessage: "Album Created! Redirecting..",
          alertType:"success"
        });
        this.$router.push(`/album/${this.newAlbumName}`);
      } catch (e) {
        const j = e.response.data
        this.$store.commit("alert/insertAlert", {
          alertMessage: `Could not create Album. ${j.msg}`,
        });
        this.buttonDisable = false
      }
    },
  },
};
</script>