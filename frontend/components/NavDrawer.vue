<template>
  <v-navigation-drawer v-model="show" app>
    <v-list nav dense>

      <v-list-item @click="onHome">
        <v-list-item-icon>
          <v-icon>mdi-home</v-icon>
        </v-list-item-icon>
        <v-list-item-title>Home</v-list-item-title>
      </v-list-item>

      <v-divider v-if="this.$store.state.profile.profile"></v-divider>

      <v-list-item v-if="this.$store.state.profile.profile" @click="onLogout">
        <v-list-item-icon>
          <v-icon>mdi-logout</v-icon>
        </v-list-item-icon>
        <v-list-item-title>Log out</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
export default {
  data: function () {
    return {
      show: false,
    };
  },
  methods: {
    onHome: function () {
      this.$router.push("/");
    },
    onFavourites: function() {
      this.$router.push("/favourites");
    },
    onFeedList: function () {
      this.$router.push("/showfeeds");
    },
    onFeedAdd: function () {
      this.$router.push("/addfeed");
    },
    onLogout: function () {
      this.$router.push("/logout");
    },
  },
};
</script>