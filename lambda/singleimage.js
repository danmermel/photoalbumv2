// ...existing code...
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const db = require('./db.js');

const REGION = process.env.AWS_REGION || "eu-west-1";
const s3 = new S3Client({ region: REGION });

const BUCKET = process.env.BUCKET;
const LARGE_THUMBS_BUCKET = process.env.LARGE_THUMBS_BUCKET;
const API_KEY = process.env.API_KEY;
const TABLE = process.env.TABLE

exports.handler = async function (spec) {

  // first check if the API KEY is correct
  if (!spec.queryStringParameters || !spec.queryStringParameters.apikey || spec.queryStringParameters.apikey !== API_KEY) {
    return { statusCode: 401, body: '{"ok": false}' }
  }

  // get query string parameters
  const key = spec.queryStringParameters.key
  if (!key) {
    return { statusCode: 400, body: '{"ok": false,"msg": "Missing image key parameter"}' }
  }
  let retval = {"ok":true}

  try {

    // create presigned urls that allows object to be fetched and downloaded for 7 days
    const viewCmd = new GetObjectCommand({ Bucket: LARGE_THUMBS_BUCKET, Key: key })
    retval.viewurl = await getSignedUrl(s3, viewCmd, { expiresIn: 60 * 60 * 24 * 7 })

    // create a download URL for the original image file
    const downloadCmd = new GetObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ResponseContentDisposition: `attachment; filename="${key}"`
    })
    retval.downloadurl = await getSignedUrl(s3, downloadCmd, { expiresIn: 60 * 60 * 24 * 7 })

    // create a url to access the original uploaded file (no content-disposition)
    const originalCmd = new GetObjectCommand({ Bucket: BUCKET, Key: key })
    retval.originalurl = await getSignedUrl(s3, originalCmd, { expiresIn: 60 * 60 * 24 * 7 })

    //now get the tags for the image
    retval.tags = await db.readtags(key)

  } catch (e) {
    console.log('ERROR!', e)
    return { statusCode: 500, body: '{"ok": false}' }

  }
  return { statusCode: 200, body: JSON.stringify(retval) }

}
// ...existing code...