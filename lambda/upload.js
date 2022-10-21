
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  signatureVersion: 'v4',
});

const BUCKET = process.env.BUCKET;
const API_KEY = process.env.API_KEY;

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
  const album = spec.queryStringParameters.album
  if (!album) {
    return { statusCode: 400, body: '{"ok": false,"msg": "Missing album parameter"}' }
  }
  if (!album.match(/^[a-zA-Z0-9_]+$/)) {
    return { statusCode: 400, body: '{"ok": false,"msg": "Invalid album name. Only letters, numbers and underscore allowed. No spaces"}' }
  }
  if (!key.match(/^[a-zA-Z0-9_\-\.]+$/)) {
    return { statusCode: 400, body: '{"ok": false,"msg": "Invalid key name. Only letters, numbers, dots, dashes and underscore allowed. No spaces"}' }
  }
  let retval = {"ok":true}

  try {
    // create presigned urls that allows object to be fetched and downloaded for 7 days
    const s3Key = `${album}/${key}`
    const opts = { Bucket: BUCKET, Key: s3Key, Expires: 60 * 60 * 24 * 7 }
    retval.url = await s3.getSignedUrlPromise('putObject', opts)
  } catch (e) {
    console.log('ERROR!', e)
    return { statusCode: 500, body: '{"ok": false}' }

  }
  return { statusCode: 200, body: JSON.stringify(retval) }

}
