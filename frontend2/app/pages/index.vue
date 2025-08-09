<script setup>
const { sortedAlbumList, loadAlbumList, createAlbum } = useAlbumList();

const newAlbumName = ref("");
const buttonDisable = ref(false);

// get the list of albums
await loadAlbumList();

//create albums function

async function createNewAlbum() {
  buttonDisable.value = true;
  //try to create an album
  await createAlbum(newAlbumName.value);
  buttonDisable.value = false;
}
</script>

<template>
  <v-row>
    <v-col class="d-flex child-flex" sm="4" lg="2" md="3" cols="6" v-for="album in sortedAlbumList" :key="album">
      <v-card height="200px"  width="300px" image="assets/folder.png" :to="`/album/${album}`"  hover>
        <v-card-title class="justify-center">{{album}}</v-card-title>
      </v-card>
    </v-col>
  </v-row>

  <!-- <v-list>
    <v-list-item v-for="album in sortedAlbumList" :key="album" :to="`/album/${album}`">{{ album}} </v-list-item> 
  </v-list> -->
  <!-- <div>
    <v-container>
      <v-layout row wrap>
        <v-flex xs6 md3 mb-1 px-1 v-for="album in sortedAlbumList" :key="album">
          <v-card
            color="blue darken-1"
            height="100px"
            :href="`/album/${album}`"
            nuxt
          >
            <v-card-title class="justify-center">{{ album }}</v-card-title>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container> -->
  <v-text-field v-model="newAlbumName" label="New Album name" required></v-text-field>
  <v-btn :disabled="buttonDisable" @click="createNewAlbum">Create</v-btn>
</template>