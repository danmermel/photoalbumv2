// ...existing code...
const { S3Client, ListObjectsCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const REGION = process.env.AWS_REGION || "eu-west-1";
const s3 = new S3Client({ region: REGION });

const BUCKET = process.env.BUCKET;
const API_KEY = process.env.API_KEY;

exports.handler = async function (spec) {

  // first check if the API KEY is correct
  if (!spec.queryStringParameters || !spec.queryStringParameters.apikey || spec.queryStringParameters.apikey !== API_KEY) {
    return { statusCode: 401, body: '{"ok": false}' }
  }

  // get query string parameters
  const album = spec.queryStringParameters.album
  if (!album) {
    return { statusCode: 400, body: '{"ok": false,"msg": "Missing album parameter"}' }
  }
  let data
  let retval = []
  const marker = spec.queryStringParameters.marker || ''

  try {

    const params = {
      Bucket: BUCKET,
      Prefix: album,
      Marker: marker,
      MaxKeys: 20
    }
    data = await s3.send(new ListObjectsCommand(params))

    const contents = data.Contents || []
    for (var i = 0; i < contents.length; i++) {
      const key = contents[i].Key
      // create presigned url that allows object to be fetched for 7 days
      const getCmd = new GetObjectCommand({ Bucket: BUCKET, Key: key })
      const url = await getSignedUrl(s3, getCmd, { expiresIn: 60 * 60 * 24 * 7 })
      const obj = {
        key,
        url,
        album,
        image : key.split("/")[1]
      }
      retval.push(obj)
    }
  } catch (e) {
    console.log('ERROR!', e)
    return { statusCode: 500, body: '{"ok": false}' }

  }
  return { statusCode: 200, body: JSON.stringify({ "ok": true, images: retval, endReached: !data.IsTruncated }) }

}
// ...existing code...