export default function () {
  const imageList = useState('imageList', () => { return [] })
  const endReached = useState('endReached', () => { return false })
  const marker = useState('marker', () => { return '' })

  const runtimeConfig = useRuntimeConfig()
  const { auth } = useAuth()
  const { showAlert } = useShowAlert()

  // fetch a list of images
  async function resetData() {
    imageList.value = []
    endReached.value = false
    marker.value = ''
  }

  async function loadImages(albumName, tag) {
    let lastKey

    if (endReached.value) {
      //nothing else to fetch
      return
    }

    const paramsObj = {
      apikey: auth.value.apiKey,
      album: albumName,
      tag
    };

    let response
    if (marker.value) {
      paramsObj.marker = marker.value
      paramsObj.LastEvaluatedKey = marker.value
      console.log("added marker ", marker.value)
    }
    const searchParams = new URLSearchParams(paramsObj);


    if (tag) {
      console.log("loading tag ", tag)
      response = await $fetch(runtimeConfig.public.tagViewAPIFunctionUrl.value + "?" + searchParams.toString());
      marker.value = response.LastEvaluatedKey
      endReached.value = response.LastEvaluatedKey ? false : true
      //true or false depending on whether the end has been reached. LEK is blank if the end has been reached


    } else {
      console.log("loading album ", albumName)
      response = await $fetch(runtimeConfig.public.singleAlbumAPIFunctionUrl.value + "?" + searchParams.toString());
      marker.value = response.images[response.images.length - 1].key
      endReached.value = response.endReached


    }

    console.log(response, endReached.value, marker.value)
    //frig the response so that we pull out the albumid and imageid separately
  
    imageList.value = imageList.value.concat(response.images.map(function (i){
      const bits = i.key.split("/")
      i.albumName = bits[0]
      i.imageId = bits[1]
      return i
    }))
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

  return { loadImages, deleteImage, resetData, imageList, endReached }
}