<script setup>

import { VFileUpload } from 'vuetify/labs/VFileUpload'

const { loadImages, imageList, endReached } = useAlbum()
const { deleteAlbum } = useAlbumList()


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
const displayDialog = ref(false)


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

async function doDelete() {
  displayDialog.value = false
  await deleteAlbum(id)
}

async function test() {
  console.log("model updated")
}
</script>

<template>
  <ConfirmDialog title="Are you sure you want to delete this album?" :text="id" verb="Delete"
    :displayDialog="displayDialog" @cancel="displayDialog = false" @confirm="doDelete"></ConfirmDialog>
  <v-row v-if="!uploadPhotos">
    <v-btn v-if="imageList.length === 0" color="warning" @click="displayDialog = true">Delete Album</v-btn>
  </v-row>
  <v-row>
    <v-col v-for="n in imageList" :key="n.key" class="d-flex child-flex" sm="4" lg="2" md="3" cols="6">
      <v-card :to="`/album/${id}/image/${n.image}`">
        <v-img min-height="200" min-width="200" :src="n.url">
        </v-img>
        <!-- <v-img cover eager transition="false" min-height="200" :src="n.url"></v-img> -->

      </v-card>
    </v-col>
  </v-row>
  <v-btn v-if="!endReached" @click="loadImages(id)">Load More</v-btn>
  <v-row v-if="uploading">
    <v-progress-linear indeterminate color="yellow-darken-2"></v-progress-linear>
    {{ progress }} / {{ files.length }}
  </v-row>
  <v-row v-if="transforming">
    <v-progress-linear color="yellow-darken-2" indeterminate></v-progress-linear>
  </v-row>

  <v-file-upload style="margin-top:40px" :disabled="uploading || transforming" v-model="files" multiple
    density="default" @update:modelValue="onFileChange()"></v-file-upload>
</template>