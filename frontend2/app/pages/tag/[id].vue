<script setup>
const { loadImages, resetData, imageList, endReached } = useAlbum()
const route = useRoute()
const tag = route.params.id

//clear the image list and endreached before searching by tag
await resetData()
await loadImages(null, tag)
</script>

<template>
  <PhotoGrid :imageList="imageList" :endReached="endReached" :tag="tag" :loadImages="loadImages"></PhotoGrid>
</template>