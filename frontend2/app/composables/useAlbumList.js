import useShowAlert from "./useShowAlert"

export default function () {
  const albumList = useState('albumList', () => { return [] })
  const runtimeConfig = useRuntimeConfig()
  const {auth } = useAuth()
  const {showAlert} = useShowAlert()

  //operations
  //load album list from API
  async function loadAlbumList() {
    const response = await $fetch(runtimeConfig.public.listAlbumsAPIFunctionUrl.value + "?apikey=" + auth.value.apiKey);
    console.log(response)
    albumList.value = response.albums
  }

  //add a new album

  async function createAlbum (newAlbumName) {
    //try to create an album
    try {
      await $fetch(runtimeConfig.public.createAlbumAPIFunctionUrl.value + "?apikey=" + auth.value.apiKey + "&album=" + newAlbumName );
      albumList.value.push(newAlbumName)  //add to the existing list of albums
      showAlert("New Album created")
      //await navigateTo(`/album/${newAlbumName}`)
      console.log(albumList.value)
    } catch {
      showAlert("Failed to create new Album", "error")
      console.error("failed to add album")
    }
  }

  const sortedAlbumList = computed(() => {
    return albumList.value.sort()
  })
  //delete an album
  return { albumList, loadAlbumList, createAlbum, sortedAlbumList }
}
