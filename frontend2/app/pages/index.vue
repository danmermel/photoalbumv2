

<script setup>

const auth = useAuth();
const runtimeConfig = useRuntimeConfig()
const alert = useAlert();

const albums = ref([])
const newAlbumName = ref('')
const buttonDisable = ref(false)

// store.commit("profile/saveMode", "albumlist");
const response = await useFetch(runtimeConfig.public.listAlbumsAPIFunctionUrl.value + "?apikey=" + auth.value.apiKey);
console.log(response.data.value)
albums.value = response.data.value.albums

//create albums function

async function createAlbum () {
  buttonDisable.value = true
  //try to create an album
  const response = await useFetch(runtimeConfig.public.createAlbumAPIFunctionUrl.value + "?apikey=" + auth.value.apiKey + "&album=" + newAlbumName.value );
  buttonDisable.value = false
  if (response.data.value && response.data.value.ok) {
    alert.value.ts = new Date().getTime();
    alert.value.message = "Album added";
    await navigateTo(`/album/${newAlbumName.value}`)
  } else {
    alert.value.ts = new Date().getTime();
    alert.value.message = "Failed to add Album: ";
  }

}

    //return { albums: response.albums };

  // methods: {
    // createAlbum: async function () {
    //   this.buttonDisable = true
    //   const profile = this.$store.state.profile.profile;
    //   const url = `${config.createAlbumAPIFunctionUrl.value}?apikey=${profile.apikey}&album=${this.newAlbumName}`;
    //   try {
    //     const response = await this.$axios.$get(url);
    //     this.$store.commit("alert/insertAlert", {
    //       alertMessage: "Album Created! Redirecting..",
    //       alertType:"success"
    //     });
    //     this.$router.push(`/album/${this.newAlbumName}`);
    //   } catch (e) {
    //     const j = e.response.data
    //     this.$store.commit("alert/insertAlert", {
    //       alertMessage: `Could not create Album. ${j.msg}`,
    //     });
    //     this.buttonDisable = false
    //   }
    // },

</script>

<template>
  <div>
    <v-container>
      <v-layout row wrap>
        <v-flex xs6 md3 mb-1 px-1 v-for="album in albums" :key="album" >
          <v-card color="blue darken-1" height="100px" :href="`/album/${album}`" nuxt>
            <v-card-title class="justify-center">{{ album }}</v-card-title>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
    <v-text-field
      v-model="newAlbumName"
      label="New Album name"
      required
    ></v-text-field>
    <v-btn :disabled="buttonDisable" @click="createAlbum">Create</v-btn>
  </div>
</template>