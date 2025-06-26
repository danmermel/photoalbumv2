<script setup>
  // composables
  const auth = useAuth()
  auth.value.authenticated = false
  localStorage.removeItem("albumapikey")
  await navigateTo('/login')
</script>