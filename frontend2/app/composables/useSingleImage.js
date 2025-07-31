export default function () {
  const image = useState('image', () => { return {} })

  async function loadImage(albumName, imageId) {
    const key = `${albumName}/${imageId}`;
    const encodedkey = encodeURIComponent(key)
    const paramsObj = {
      apikey: auth.value.apiKey,
      key: encodedkey
    }

    const searchParams = new URLSearchParams(paramsObj);

    const response = await $fetch(runtimeConfig.public.singleImageAPIFunctionUrl.value + "?" + searchParams.toString());
    console.log(response)

  }
  return { image, loadImage }
}

