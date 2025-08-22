<script setup>
const { loadImages, imageList, endReached } = useAlbum()
const route = useRoute()
const tag = route.params.id

// searching by tag
await loadImages(null, tag)
</script>

<template>
  <PhotoGrid :imageList="imageList" :endReached="endReached" :tag="tag" :loadImages="loadImages"></PhotoGrid>
</template>