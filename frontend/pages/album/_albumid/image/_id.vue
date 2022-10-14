<template>
  <v-container>
    <v-row>
      <v-img :src="viewurl" class="grey lighten-2"> </v-img>
    </v-row>
    <v-row>
      <v-chip small v-for="tag in tags" :key="tag">{{ tag }}</v-chip>
    </v-row>
    <v-row>
      <v-btn color="success" @click="download">Download</v-btn>
    </v-row>
  </v-container>
</template>

<style>
.v-chip {
  margin: 3px
}
</style>

<script>
const config = require("../../../../config.json");
export default {
  data: function () {
    return {
      viewurl:"",
      downloadurl: "",
      tags: [],
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
    console.log(route.params)
    const key = `${route.params.albumid}/${route.params.id}`
    const encodedkey = encodeURIComponent(key)

    store.commit("profile/saveMode", "singleimage");


    // fetch image from the API
    const url = `${config.singleImageAPIFunctionUrl.value}?apikey=${profile.apikey}&key=${encodedkey}`;
    const response = await $axios.$get(url);
    return response;
  },
  methods: {
    download: function() {
      window.location.href=this.downloadurl
    }
  }
};
</script>