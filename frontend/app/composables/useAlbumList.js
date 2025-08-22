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
      await navigateTo(`/album/${newAlbumName}`)
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

  async function deleteAlbum(id) {
  try {
    const paramsObj = {
      apikey: auth.value.apiKey,
      album: id //from the route
    };
    const searchParams = new URLSearchParams(paramsObj);
    const response = await $fetch(runtimeConfig.public.deleteAlbumAPIFunctionUrl.value + "?" + searchParams.toString());
    //console.log("response is ", response)
    // now remove from albumList
    const i = albumList.value.indexOf(id)
    if (i > -1) {
      //found it. Remove it 
      albumList.value.splice(i, 1)
    }
    console.log("calling show alert")
    showAlert("Album Deleted successfully")
    await navigateTo('/')
  } catch (e) {
    console.error(e)
  }


}
  return { albumList, loadAlbumList, createAlbum, deleteAlbum, sortedAlbumList }
}
