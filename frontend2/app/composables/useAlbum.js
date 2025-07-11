export default function () {
  const imageList = useState('imageList', () => { return [] })
  const endReached = useState('endReached', () => { return false })
  const runtimeConfig = useRuntimeConfig()
  const {auth } = useAuth()
  const {showAlert} = useShowAlert()

  // fetch a list of images

async function loadImages(albumName) {
  let lastKey



  if (endReached.value){
    //nothing else to fetch
    return
  }
  if (imageList.value.length >0) {
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

  // have we reached the end

   // upload to album

  //load more
  return {loadImages, imageList, endReached }
}