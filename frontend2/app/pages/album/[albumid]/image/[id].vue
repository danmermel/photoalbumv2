<script setup>
const { image, loadImage } = useSingleImage()
const { imageList, deleteImage } = useAlbum()
const route = useRoute()

const albumId = route.params.albumid
const imageId = route.params.id

const leftUrl = ref('')
const rightUrl = ref('')
const key = ref('')
const disableButton = ref(false)
const displayDialog = ref(false)

// const runtimeConfig = useRuntimeConfig()
// const { auth } = useAuth()
// const { showAlert } = useShowAlert()


await loadImage(albumId, imageId)

key.value = `${albumId}/${imageId}`;

async function doDelete() {
  console.log("deleting image")
  displayDialog.value=false
  disableButton.value = true
  await deleteImage(key.value)
  disableButton.value = false
  await navigateTo(`/album/${albumId}`)
}
//calculate the next and previous images
// console.log(JSON.stringify(imageList))
//iterate through array and find the index of the current image
for (var i = 0; i < imageList.value.length; i++) {
  if (key.value === imageList.value[i].key) {
    //found the index
    //console.log("found index at ", i, typeof i)
    const leftImageId = i > 0 ? imageList.value[i - 1].key.split("/")[1] : ""
    const rightImageId = i < imageList.value.length - 1 ? imageList.value[i + 1].key.split("/")[1] : ""
    leftUrl.value = leftImageId.length > 0 ? `/album/${albumId}/image/${leftImageId}` : ""
    rightUrl.value = rightImageId.length > 0 ? `/album/${albumId}/image/${rightImageId}` : ""
    break
  }
}

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
  <ConfirmDialog title="Are you sure you want to delete this image?" :text="key" verb="Delete"
    :displayDialog="displayDialog" @cancel="displayDialog = false" @confirm="doDelete"></ConfirmDialog>
  <v-btn v-if="leftUrl" color="medium-emphasis" icon="mdi-arrow-left" size="small" :to="leftUrl"></v-btn>

  <v-btn v-if="rightUrl" color="medium-emphasis" icon="mdi-arrow-right" size="small" :to="rightUrl"></v-btn>
  <v-card>
    <v-img :src="image.viewurl" min-height="200px" min-width="200px" cover></v-img>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn :disabled="disableButton" variant="flat" color="error" @click="displayDialog=true">Delete</v-btn>
    </v-card-actions>
  </v-card>
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
