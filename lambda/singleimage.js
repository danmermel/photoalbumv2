
const AWS = require('aws-sdk');
const db = require('./db.js');

const s3 = new AWS.S3({
  signatureVersion: 'v4',
});

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
  let data
  let retval = {"ok":true}

  try {

    // create presigned urls that allows object to be fetched and downloaded for 7 days
    const opts = { Bucket: LARGE_THUMBS_BUCKET, Key: key, Expires: 60 * 60 * 24 * 7 }
    retval.viewurl = await s3.getSignedUrlPromise('getObject', opts)

    // create a download URL for the original image file
    opts.Bucket = BUCKET
    opts.ResponseContentDisposition = `attachment; filename="${key}"`
    retval.downloadurl = await s3.getSignedUrlPromise('getObject', opts)

    //now get the tags for the image
    retval.tags = await db.readtags(key)

  } catch (e) {
    console.log('ERROR!', e)
    return { statusCode: 500, body: '{"ok": false}' }

  }
  return { statusCode: 200, body: JSON.stringify(retval) }

}
