<script setup>
const { image, loadImage } = useSingleImage()
const albumId = route.params.albumid
const imageId = route.params.id

await loadImage(albumId, imageId)

// const config = require("../../../../config.json");
// export default {
//   data: function () {
//     return {
//       viewurl: "",
//       downloadurl: "",
//       tags: [],
//       encodedkey: "",
//       albumid: "",
//       displayDeleteDialog: false,
//       leftKey:"",
//       rightKey:""

//     };
//   },
//   async asyncData({ redirect, store, $axios, route }) {
//     // load recent photo list from local storage (profile)
//     const profile = store.state.profile.profile;
//     if (!profile) {
//       //not logged in so bounce to home page
//       redirect("/");
//       return;
//     }
//     //console.log(route.params);
//     const key = `${route.params.albumid}/${route.params.id}`;
//     const encodedkey = encodeURIComponent(key);

//     store.commit("profile/saveMode", "singleimage");

//     // fetch image from the API
//     const url = `${config.singleImageAPIFunctionUrl.value}?apikey=${profile.apikey}&key=${encodedkey}`;
//     const response = await $axios.$get(url);
//     response.encodedkey = encodedkey;
//     response.albumid = route.params.albumid;

//     //calculate the next and previous images
//     const imageList = profile.albumImages
//     // console.log(JSON.stringify(imageList))
//     //iterate through array and find the index of the current image
//     for (var i =0; i< imageList.length; i++) {
//       if (key === imageList[i].key) {
//         //found the index
//         //console.log("found index at ", i, typeof i)
//         response.leftKey = i>0 ? imageList[i-1].key : ""
//         response.rightKey = i<imageList.length-1 ? imageList[i+1].key : ""
//         //console.log(imageList[i], imageList[i+1])
//         break
//       }
//     }

//     return response;
//   },
//   methods: {
//     download: function () {
//       window.location.href = this.downloadurl;
//     },
//     deleteImage: function () {
//       this.displayDeleteDialog = true;
//     },
//     doDelete: async function () {
//       this.displayDeleteDialog = false;
//       const profile = this.$store.state.profile.profile;
//       const url = `${config.deleteAPIFunctionUrl.value}?apikey=${profile.apikey}&key=${this.encodedkey}`;
//       const response = await this.$axios.$get(url);
//       this.$store.commit("alert/insertAlert", {
//         alertMessage: "Image deleted! Redirecting to Album..",
//         alertType: "success",
//       });
//       // invalidate the cache to allow the page to reload the album's contents
//       this.$store.commit("profile/saveCurrentAlbum", "");

//       const self = this;

//       // don't refresh immediately otherwise the thumbnails won't be built yet
//       setTimeout(function () {
//         self.$router.push(`/album/${self.albumid}`);
//       }, 3000);
//     },
//     cancelDelete: function () {
//       this.displayDeleteDialog = false;
//     },
//     clickLeft: function () {
//       //console.log(this.leftKey)
//       var url = "/album/" + this.leftKey.replace("/", "/image/")
//       this.$router.push(url)
//     },
//     clickRight: function () {
//       //console.log(this.rightKey)
//       var url = "/album/" + this.rightKey.replace("/", "/image/")
//       this.$router.push(url)
//     },
//   },
// };
</script>

<template>
  <!-- <v-container>
    <v-row>
      <v-col cols="4" sm="4" class="tal">
        <v-btn v-if="leftKey" class="mx-2" fab dark small color="primary" @click="clickLeft">
          <v-icon dark> mdi-arrow-left </v-icon>
        </v-btn>
      </v-col>
      <v-col cols="4"></v-col>
      <v-col cols="4" sm="4" class="tar">
        <v-btn v-if="rightKey" class="mx-2" fab dark small color="primary" @click="clickRight">
          <v-icon dark> mdi-arrow-right </v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" sm="12">
        <v-row>
          <v-img :src="viewurl" class="grey lighten-2"> </v-img>
        </v-row>
        <v-row>
          <v-chip small v-for="tag in tags" :key="tag" :href="`/tag/${tag}`" nuxt>{{tag}}</v-chip>
        </v-row>
        <v-row>
          <v-btn color="success" @click="download">Download</v-btn>
        </v-row>
        <v-row>
          <v-btn color="error" @click="deleteImage">Delete</v-btn>
        </v-row>
      </v-col>
    </v-row>
    <ConfirmDialog
      :displayDialog="displayDeleteDialog"
      title="Are you sure?"
      text="Confirm deletion of this image?"
      verb="Delete"
      @confirm="doDelete"
      @cancel="cancelDelete"
    />
  </v-container> -->
</template>

