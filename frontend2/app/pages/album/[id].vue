<script setup>

const { loadImages, imageList, endReached } = useAlbum()
const route = useRoute()
const runtimeConfig = useRuntimeConfig()
const { auth } = useAuth()
const { showAlert } = useShowAlert()
const id = route.params.id

const uploading = ref(false)
const progress = ref(0)
const files = ref([])
const uploadPhotos = ref(false)
const failures = ref([])
const transforming = ref(false)

await loadImages(id)

async function onFileChange() {
  uploading.value = true
  progress.value = 0
  failures.value = []

  for (let file of files.value) {
    let response

    try {
      // get a presigned URL for upload
      const paramsObj = {
        apikey: auth.value.apiKey,
        album: id, //from the route
        key: file.name
      };
      const searchParams = new URLSearchParams(paramsObj);
      response = await $fetch(runtimeConfig.public.uploadAPIFunctionUrl.value + "?" + searchParams.toString());
      console.log("url response is ", response)
      const uploadURL = response.url

      // put to that presigned URL
      const headers = {
        "Content-Type": file.type
      };
      response = await $fetch(uploadURL, {
        method: "PUT",
        body: file,
        headers
      })
      //console.log(response)
    } catch (e) {
      console.log('error', e)
      failures.value.push(file.name)
    }
    progress.value++
  }
  uploading.value = false
  uploadPhotos.value = false
  transforming.value = true
  files.value = []

  // don't refresh immediately otherwise the thumbnails won't be built yet
  setTimeout(async function () {
    endReached.value = false  // reset all this so that the load can start again
    imageList.value = []
    await loadImages(id)
    transforming.value = false
    if (failures.value.length === 0) {
      console.log("no errors")
      showAlert('Images uploaded successfully')
    } else {
      console.log("have errors")
      showAlert(`Images uploaded but with errors: ${failures.value}`, "warning", true)
    }
  }, 5000)
}

//     doDelete: async function() {
//       this.displayDeleteDialog = false
//       const profile = this.$store.state.profile.profile;
//       const url = `${config.deleteAlbumAPIFunctionUrl.value}?apikey=${profile.apikey}&album=${this.album}`;
//       try {
//         const response = await this.$axios.$get(url);
//         this.$store.commit("alert/insertAlert", {
//           alertMessage: "Album Deleted! Redirecting..",
//           alertType:"success"
//         });
//         this.$router.push(`/albums`);
//       } catch (e) {
//         const j = e.response.data
//         this.$store.commit("alert/insertAlert", {
//           alertMessage: `Could not delete Album. ${j.msg}`,
//         });
//       }
//     },
//     cancelDelete: function() {
//       this.displayDeleteDialog = false
//     }
//   }
// };

</script>


<template>
  <v-row v-if="uploading">
    <v-progress-linear :value="100 * progress / files.length"></v-progress-linear>
    <div>
      {{ progress }} / {{ files.length }}
    </div>
  </v-row>
  <v-row v-if="transforming">
    <v-progress-linear color="yellow-darken-2" indeterminate></v-progress-linear>
  </v-row>
  <v-row v-if="uploadPhotos && !uploading">
    <v-file-input v-model="files" small-chips outlined dense multiple label="Add photos to this Album">
    </v-file-input>
    <v-btn @click="uploadPhotos = false">Cancel</v-btn>
    <v-btn :disabled="files.length === 0" @click="onFileChange()">Upload </v-btn>
  </v-row>
  <v-row v-if="!uploadPhotos">
    <v-btn @click="uploadPhotos = true">Upload</v-btn>
    <!-- <v-btn v-if="computedImages.length === 0" color="warning" @click="deleteAlbum">Delete Album</v-btn> -->
  </v-row>
  <v-row>
    <v-col v-for="n in imageList" :key="n.key" class="d-flex child-flex" cols="3">
      <v-img :src="n.url" aspect-ratio="1" class="bg-grey-lighten-2" cover>
      </v-img>
    </v-col>
  </v-row>
  <v-btn v-if="!endReached" @click="loadImages(id)">Load More</v-btn>

</template>