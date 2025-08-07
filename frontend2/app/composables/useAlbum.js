export default function () {
  const imageList = useState('imageList', () => { return [] })
  const endReached = useState('endReached', () => { return false })
  const runtimeConfig = useRuntimeConfig()
  const { auth } = useAuth()
  const { showAlert } = useShowAlert()

  // fetch a list of images

  async function loadImages(albumName) {
    let lastKey

    if (endReached.value) {
      //nothing else to fetch
      return
    }
    if (imageList.value.length > 0) {
      // find the marker for the last image fetched
      lastKey = imageList.value[imageList.value.length - 1].key
    }
    const paramsObj = {
      apikey: auth.value.apiKey,
      album: albumName
    };
    if (lastKey) {
      paramsObj.marker = lastKey
    }
    const searchParams = new URLSearchParams(paramsObj);

    const response = await $fetch(runtimeConfig.public.singleAlbumAPIFunctionUrl.value + "?" + searchParams.toString());
    console.log(response)
    imageList.value = imageList.value.concat(response.images)
    endReached.value = response.endReached
  }

  async function deleteImage(key) {
    const paramsObj = {
      apikey: auth.value.apiKey,
      key
    };
    const searchParams = new URLSearchParams(paramsObj);
    const response = await $fetch(runtimeConfig.public.deleteAPIFunctionUrl.value + "?" + searchParams.toString());
    //now find the deleted image in the image list and remove it
    let i
    for (i in imageList.value) {
      if (key === imageList.value[i].key) {
         imageList.value.splice(i, 1)
         showAlert("Image deleted successfully")
         break
      }
    }

  }

  return { loadImages, deleteImage, imageList, endReached }
}