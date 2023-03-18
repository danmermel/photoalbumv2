<template>
  <v-container>
    <v-row>
      <v-col v-if="computedImages.length===0">
        <h2>There are no images matching the tag {{ tag }}</h2>

      </v-col>
      <v-col
        v-for="n in computedImages"
        :key="n.key"
        sm="4"
        lg="2"
        md="3"
        cols="6"
      > <NuxtLink :to="`/album/${n.album}/image/${n.filename}`">
        <v-img
          :src="n.url"
          aspect-ratio="1"
          class="grey lighten-2"
        >
        </v-img></NuxtLink>
      </v-col>
      <v-col>
        <v-btn v-if="LastEvaluatedKey" @click="loadMore">Load More</v-btn>
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
      LastEvaluatedKey:null,
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
    store.commit('profile/saveMode', 'singlealbum')

    //if this is the same tag as we have in the cache, we needn't call a Lambda
    // console.log("Current cached tag is ", profile.album)
    // console.log("VIsiting tag ", tag)
    if (profile.album === tag) {
      //console.log("Retrieving from cache")
      return {
        images: profile.albumImages,
        tag,
        LastEvaluatedKey: profile.lastEvaluatedKey
      }
    }

    //store the current tag in the store
    store.commit('profile/saveCurrentAlbum', tag)

    // fetch albums from the API
    const url = `${config.tagViewAPIFunctionUrl.value}?apikey=${profile.apikey}&tag=${tag}`;
    const response = await $axios.$get(url);
    store.commit('profile/saveAlbumImages', response.images)
    store.commit('profile/saveLastEvaluatedKey', response.LastEvaluatedKey)
    // console.log("lastevalkey is ", response.LastEvaluatedKey)
    return { images: response.images, tag, LastEvaluatedKey:response.LastEvaluatedKey };
  },
  computed: {
    computedImages: function () {
      return this.images.map(function (i) {
        //get the last string after the slash
        i.filename = i.key.match(/\/(.*$)/)[1]
        i.album = i.key.match(/^(.*)\//)[1]
        return i
      })
    }
  },
  methods: {
    loadMore: async function() {  
      const profile = this.$store.state.profile.profile;
      const encodedKey = encodeURIComponent(this.LastEvaluatedKey)
      const url = `${config.tagViewAPIFunctionUrl.value}?apikey=${profile.apikey}&tag=${this.tag}&LastEvaluatedKey=${encodedKey}`
      //console.log("url is ", url)
      const response = await this.$axios.$get(url);
      this.images = this.images.concat(response.images)
      //update the last evaluatedkey for loading more
      this.LastEvaluatedKey = response.LastEvaluatedKey
      //console.log("Now lastevalkey is ", this.LastEvaluatedKey)
      this.$store.commit('profile/saveAlbumImages', this.images)
      this.$store.commit('profile/saveLastEvaluatedKey', response.LastEvaluatedKey)
    },
  }
};
</script>