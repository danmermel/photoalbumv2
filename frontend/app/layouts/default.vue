
<script setup>
  const { auth } = useAuth()

// local page items
const drawer = ref(false);

</script>
<template>
  <!-- <VitePwaManifest /> -->
  <v-app theme="light">
    <v-app-bar density="compact">
      <template v-slot:prepend>
        <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      </template>
      <v-app-bar-title @click="navigateTo('/')">Photo Album</v-app-bar-title>
    </v-app-bar>
    <v-navigation-drawer v-model="drawer" location="left">
      <v-list>
        <v-list-item
          v-if="auth.authenticated"
          prepend-icon="mdi-logout"
          title="Logout"
          @click="navigateTo('/logout')"
        ></v-list-item>
        <v-list-item
          v-if="!auth.authenticated"
          prepend-icon="mdi-login"
          title="Login"
          @click="navigateTo('/login')"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-main>
      <v-container fluid>
        <Alert></Alert>
        <slot />
      </v-container>
    </v-main>
  </v-app>
</template>
