<template>
  <v-container>
    <v-row>
      <v-img :src="viewurl" class="grey lighten-2"> </v-img>
    </v-row>
    <v-row>
      <v-chip small v-for="tag in tags" :key="tag" :href="`/tag/${tag}`" nuxt>{{ tag }}</v-chip>
    </v-row>
    <v-row>
      <v-btn color="success" @click="download">Download</v-btn>
      <v-btn color="error" @click="deleteImage">Delete</v-btn>
    </v-row>
  </v-container>
</template>

<style>
.v-chip {
  margin: 3px;
}
</style>

<script>
const config = require("../../../../config.json");
export default {
  data: function () {
    return {
      viewurl: "",
      downloadurl: "",
      tags: [],
      encodedkey: "",
      albumid: "",
    };
  },
  async asyncData({ redirect, store, $axios, route }) {
    // load recent article list from local storage (profile)
    const profile = store.state.profile.profile;
    if (!profile) {
      //not logged in so bounce to home page
      redirect("/");
      return;
    }
    console.log(route.params);
    const key = `${route.params.albumid}/${route.params.id}`;
    const encodedkey = encodeURIComponent(key);

    store.commit("profile/saveMode", "singleimage");

    // fetch image from the API
    const url = `${config.singleImageAPIFunctionUrl.value}?apikey=${profile.apikey}&key=${encodedkey}`;
    const response = await $axios.$get(url);
    response.encodedkey = encodedkey;
    response.albumid = route.params.albumid;
    return response;
  },
  methods: {
    download: function () {
      window.location.href = this.downloadurl;
    },
    deleteImage: async function () {
      const profile = this.$store.state.profile.profile;
      const url = `${config.deleteAPIFunctionUrl.value}?apikey=${profile.apikey}&key=${this.encodedkey}`;
      const response = await this.$axios.$get(url);
      this.$store.commit("alert/insertAlert", {
        alertMessage: "Image deleted! Redirecting to Album..",
        alertType: "success",
      });
      // invalidate the cache to allow the page to reload the album's contents
      this.$store.commit("profile/saveCurrentAlbum", "");

      const self = this;

      // don't refresh immediately otherwise the thumbnails won't be built yet
      setTimeout(function () {
        self.$router.push(`/album/${self.albumid}`);
      }, 3000);

    },
  },
};
</script>