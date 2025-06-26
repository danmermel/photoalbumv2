

<script setup>
//first see if there is an API key for adding
const auth = useAuth();

if (auth.value.authenticated) {
  console.log("already authenticated");
  await navigateTo("/");
}

const apiKey = ref("");

// methods
const saveKey = async () => {
  //console.log('saving', apiKey.value)
  auth.value.authenticated = true;
  auth.value.apiKey = apiKey.value;
  localStorage.setItem("albumapikey", apiKey.value);
  await navigateTo("/");
};
</script>


<template>
  <div>
    <div>Enter your API Key to proceed</div>
    <v-form ref="form">
      <v-text-field v-model="apiKey" label="Api Key"></v-text-field>
      <v-btn :disabled="!apiKey" color="success" @click="saveKey">
        Submit
      </v-btn>
    </v-form>
  </div>
</template>