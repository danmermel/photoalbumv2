export default defineNuxtRouteMiddleware( (to, from) => {
    // composables
    const auth = useState('auth')
    console.log("middleware!")
    // see if we have an apikey stashed in local storage
    const v = localStorage.getItem('albumapikey')
    if (v) {
      console.log("have key ", v)
      if (!auth.value) {
        auth.value = {}
      }
      auth.value.authenticated = true
      auth.value.apiKey = v
      return
    }
    else {
      if (to.path !== '/login') {
        return navigateTo('/login')
      }
    }
  })


