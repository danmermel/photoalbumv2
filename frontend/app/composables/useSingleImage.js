export default function () {
  const image = useState('image', () => { return {} })
  const {auth } = useAuth()
  const runtimeConfig = useRuntimeConfig()


  async function loadImage(albumName, imageId) {
    const key = `${albumName}/${imageId}`;
    const paramsObj = {
      apikey: auth.value.apiKey,
      key: key
    }

    const searchParams = new URLSearchParams(paramsObj);

    const response = await $fetch(runtimeConfig.public.singleImageAPIFunctionUrl.value + "?" + searchParams.toString());
    image.value = response

  }
  return { image, loadImage }
}

