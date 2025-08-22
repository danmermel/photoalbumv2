<script setup>
defineProps(['imageList', 'loadImages', 'id', 'tag', 'endReached'])

</script>

<template>
  <v-row class="myrow">
    <v-col v-for="n in imageList" :key="n.key" class="d-flex child-flex" sm="4" lg="2" md="3" cols="6">
      <v-card :to="`/album/${n.albumName}/image/${n.imageId}`">
        <v-img min-height="200" min-width="200" :src="n.url">
        </v-img>
        <!-- <v-img cover eager transition="false" min-height="200" :src="n.url"></v-img> -->

      </v-card>
    </v-col>
  </v-row>
  <v-row class="myrow">
    <v-btn v-if="!endReached" @click="loadImages(id, tag)">Load More</v-btn>
  </v-row>

</template>