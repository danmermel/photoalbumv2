<script setup>
  // composables
  const { alert } = useShowAlert()
</script>
<template>
  <v-alert density="compact" :color="alert.colour" v-show="alert.show">{{ alert.message }}</v-alert>
</template>