<template>
  <v-list>
    <v-list-item :href="`/album/${album}`" nuxt v-for="album in albums" :key="album">
      <v-list-item-content>
        <v-list-item-title>{{ album }}</v-list-item-title>
      </v-list-item-content>
    </v-list-item>
  </v-list>
</template>

<script>
const config = require("../config.json");
export default {
  data: function () {
    return {
      albums: [],
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
    const url = `${config.listAlbumsAPIFunctionUrl.value}?apikey=${profile.apikey}`;
    const response = await $axios.$get(url);
    return { albums: response.albums };
  },
};
</script>