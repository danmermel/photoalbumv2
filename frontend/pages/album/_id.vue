<template>
  <v-container>
    <v-row v-if="uploading">
      <v-progress-linear :value="100*progress/files.length"></v-progress-linear>
      <div>
        {{ progress }} /  {{ files.length }}
      </div>
    </v-row>
    <v-row v-if="uploadPhotos && !uploading">
        <v-file-input v-model="files"
                small-chips outlined dense multiple 
                label="Add photos to this Album">
              </v-file-input>
              <v-btn  @click="uploadPhotos=false">Cancel</v-btn>
              <v-btn @click="onFileChange()">Upload </v-btn>
    </v-row>
    <v-row v-if="!uploadPhotos">
      <v-btn @click="uploadPhotos=true">Upload</v-btn>
    </v-row>
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
      uploadPhotos: false,
      uploading: false,
      progress: 0,
      failures: [],
      files: [],
      images: [],
      album: '',
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


    const album = route.params.id
    store.commit('profile/saveMode', 'singlealbum')

    // if this is the same album as we have in the cache, we needn't call a Lambda
    console.log("Current cache Album is ", profile.album)
    console.log("VIsiting album ", album)
    if (profile.album === album) {
      console.log("Retrieving from cache")
      return {
        images: profile.albumImages,
        album,
        endReached: profile.endReached
      }
    }

    // store the current album in the store
    store.commit('profile/saveCurrentAlbum', album)

    // fetch albums from the API
    const url = `${config.singleAlbumAPIFunctionUrl.value}?apikey=${profile.apikey}&album=${album}`;
    const response = await $axios.$get(url);
    store.commit('profile/saveAlbumImages', response.images)
    store.commit('profile/saveAlbumEndReached', response.endReached)
    return { images: response.images, album, endReached: response.endReached };
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
    onFileChange: async function() {
      this.uploading = true
      this.progress = 0
      this.failures = []
      const files = this.files
      const profile = this.$store.state.profile.profile;
      for(let file of files) {
        console.log('Uploading',file.name)
        console.log('file', file)
        console.log('typeof file', typeof file)
        let response

        try {
          // get a presigned URL for upload
          const url = `${config.uploadAPIFunctionUrl.value}?apikey=${profile.apikey}&album=${this.album}&key=${file.name}`;
          response = await this.$axios.$get(url);
          const uploadURL = response.url

          // put to that presigned URL
          const headers = {
            "Content-Type": file.type
          };
          response = await this.$axios.$put(uploadURL, file, {
            headers: headers,
          });
        } catch (e) {
          console.log('error', e)
          this.failures.push(file.name)
        }
        this.progress++
      }
      this.uploading = false
      this.uploadPhotos = false
      this.files = []

      // invalidate the cache to allow the page to reload the album's contents
      this.$store.commit('profile/saveCurrentAlbum', '')
      const self = this

      // don't refresh immediately otherwise the thumbnails won't be built yet
      setTimeout(function() {
        self.$nuxt.refresh()
      }, 5000)

      // in the meantime, show the user a success alert
      let msg = "Upload complete! Building thumbnails.."
      let alertType = "success"
      if (this.failures.length > 0) {
        msg = `Upload complete with some failures ${this.failures}`
        alertType = "warning"
      }
      this.$store.commit("alert/insertAlert", {
        alertMessage: msg,
        alertType
      });
    }
  }
};
</script>