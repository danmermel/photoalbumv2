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
    <v-col class="d-flex child-flex" sm="12" lg="2" md="12" v-for="album in sortedAlbumList" :key="album">
      <v-card height="200px" width="300px" image="assets/folder.png" :to="`/album/${album}`" hover>
        <v-card-title style="padding-top: 140px; color:blue">{{ album }}</v-card-title>
      </v-card>
    </v-col>
  </v-row>
  <v-row class="myrow">
    <v-text-field v-model="newAlbumName" label="New Album name" required></v-text-field>
  </v-row>
  <v-row>
    <v-btn :disabled="buttonDisable" @click="createNewAlbum">Create</v-btn>
  </v-row>
</template>