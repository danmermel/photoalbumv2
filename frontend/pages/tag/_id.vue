<template>
  <v-container>
    <v-row>
      <v-col
        v-for="n in computedImages"
        :key="n.key"
        sm="4"
        lg="2"
        md="3"
        cols="6"
      > <NuxtLink :to="`/album/${album}/image/${n.filename}`">
        <v-img
          :src="n.url"
          aspect-ratio="1"
          class="grey lighten-2"
        >
        </v-img></NuxtLink>
      </v-col>
      <v-col>
        <v-btn v-if="!endReached" @click="loadMore">Load More</v-btn>
      </v-col>
    </v-row>
    
  </v-container>

</template>

<script>
const config = require("../../config.json");
export default {
  data: function () {
    return {
      images: [],
      tag: '',
      endReached: false
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


    const tag = route.params.id
    //store.commit('profile/saveMode', 'singlealbum')

    // if this is the same album as we have in the cache, we needn't call a Lambda
    // console.log("Current cache Album is ", profile.album)
    // console.log("VIsiting album ", album)
    // if (profile.album === album) {
    //   console.log("Retrieving from cache")
    //   return {
    //     images: profile.albumImages,
    //     album,
    //     endReached: profile.endReached
    //   }
    // }

    // store the current album in the store
    // store.commit('profile/saveCurrentAlbum', album)

    // fetch albums from the API
    const url = `${config.tagViewAPIFunctionUrl.value}?apikey=${profile.apikey}&tag=${tag}`;
    const response = await $axios.$get(url);
    // store.commit('profile/saveAlbumImages', response.images)
    // store.commit('profile/saveAlbumEndReached', response.endReached)
    return { images: response.images, tag };
  },
  computed: {
    computedImages: function () {
      return this.images.map(function (i) {
        //get the last string after the slash
        i.filename = i.key.match(/\/(.*$)/)[1]
        return i
      })
    }
  },
  methods: {
    loadMore: async function() {
      const profile = this.$store.state.profile.profile;
      // the marker is used to get the next page of images. We pass it the last key we know about
      const lastKey = this.images[this.images.length - 1].key
      const url = `${config.singleAlbumAPIFunctionUrl.value}?apikey=${profile.apikey}&album=${this.album}&marker=${lastKey}`;
      const response = await this.$axios.$get(url);
      this.images = this.images.concat(response.images)
      this.endReached = response.endReached
      this.$store.commit('profile/saveAlbumImages', this.images)
      this.$store.commit('profile/saveAlbumEndReached', this.endReached)
    },
  }
};
</script>