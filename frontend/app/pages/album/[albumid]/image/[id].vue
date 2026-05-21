<script setup>
const { image, loadImage } = useSingleImage()
const { imageList, deleteImage, loadImages, endReached} = useAlbum()
const route = useRoute()


const albumId = route.params.albumid
let imageId = route.params.id

const leftUrl = ref('')
const rightUrl = ref('')
const key = ref('')
const disableButton = ref(false)
const displayDialog = ref(false)
const isVideo = ref(false)

if (imageId.match(/\.mp4\.jpg$|\.mov\.jpg$|\.avi\.jpg$/i)) {
  isVideo.value=true
  imageId = imageId.substring(0, imageId.length - 4) //remove the .jpg at the end to get the video key
}

await loadImage(albumId, imageId)



key.value = `${albumId}/${imageId}`;
//console.log("imageId is", imageId)
//console.log("is video", isVideo.value)
//console.log("image is ", image.value)

async function doDelete() {
  //console.log("deleting image")
  displayDialog.value = false
  disableButton.value = true
  await deleteImage(key.value)
  disableButton.value = false
  await navigateTo(`/album/${albumId}`)
}

//calculate the next and previous images
//iterate through array and find the index of the current image
//console.log("number of images: ", imageList.value.length)
for (var i = 0; i < imageList.value.length; i++) {
  if (key.value === imageList.value[i].key) {
    //found the index
    //console.log("found index at ", i, typeof i)
    const leftImageId = i > 0 ? imageList.value[i - 1].key.split("/")[1] : ""
    //for the right image it gets harder because you have to understand whether or not 
    //the end of the album has been reached. If it hasn't then you have to load more images
    let rightImageId
    if(i < imageList.value.length - 1) {
      //haven't reached the end of the list so keep going right
      //console.log("not at the end of the list yet")
      rightImageId = imageList.value[i + 1].key.split("/")[1]
    } else if (endReached.value) {
      //console.log("at the end of the album and the end of the list")
      //have reached the end of the list and the end of the album
      rightImageId = ""
    } else {
      // have reached the end of the list, but not the end of the album
      //so have to load more images
      //console.log("At the end of the list but not at the end of the album")
      await loadImages(albumId, null)
      rightImageId = imageList.value[i + 1].key.split("/")[1]  //because imageList is now larger than the original i in the for loop
    } 
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
    <video v-if="isVideo" autoplay controls :src="image.originalurl" style="max-height: 600px;"></video>
    <v-img v-if="!isVideo" :src="image.viewurl" min-height="200px" max-width="100%" cover></v-img>
    <v-chip small v-for="tag in image.tags" :key="tag" :to="`/tag/${tag}`" nuxt>{{ tag }}</v-chip>

    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn variant="flat" color="warning" :href="image.downloadurl">Download</v-btn>
      <v-btn :disabled="disableButton" variant="flat" color="error" @click="displayDialog = true">Delete</v-btn>
    </v-card-actions>
  </v-card>


</template>