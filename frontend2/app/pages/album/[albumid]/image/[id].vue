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

await loadImage(albumId, imageId)

key.value = `${albumId}/${imageId}`;
console.log("image is ", image.value)

async function doDelete() {
  console.log("deleting image")
  displayDialog.value = false
  disableButton.value = true
  await deleteImage(key.value)
  disableButton.value = false
  await navigateTo(`/album/${albumId}`)
}

function download() {
  window.location.href = image.value.downloadurl;
    //is this the best way to do this?
}

//calculate the next and previous images
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
</script>

<template>
  <ConfirmDialog title="Are you sure you want to delete this image?" :text="key" verb="Delete"
    :displayDialog="displayDialog" @cancel="displayDialog = false" @confirm="doDelete"></ConfirmDialog>
  <v-row>
    <v-col justify="left">
      <v-btn v-if="leftUrl" color="medium-emphasis" icon="mdi-arrow-left" :to="leftUrl"></v-btn>

    </v-col>
    <v-col justify="center">

      <v-btn color="medium-emphasis" icon="mdi-image-album" :to="`/album/${albumId}`"></v-btn>
    </v-col>
    <v-col justify="right">
      <v-btn v-if="rightUrl" color="medium-emphasis" icon="mdi-arrow-right" :to="rightUrl"></v-btn>
    </v-col>
  </v-row>
  <v-card>
    <v-img :src="image.viewurl" min-height="200px" min-width="200px" cover></v-img>
    <v-chip small v-for="tag in image.tags" :key="tag" :to="`/tag/${tag}`" nuxt>{{ tag }}</v-chip>

    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn variant="flat" color="warning" @click="download">Download</v-btn>
      <v-btn :disabled="disableButton" variant="flat" color="error" @click="displayDialog = true">Delete</v-btn>
    </v-card-actions>
  </v-card>
</template>