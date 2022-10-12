<template>
  <div>
    <v-img :src="viewurl" aspect-ratio="1" class="grey lighten-2"> </v-img>
    {{ tags }}
  </div>
</template>
  
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
};
</script>