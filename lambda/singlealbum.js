
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
    data = await s3.listObjects(params).promise()

    for (var i = 0; i < data.Contents.length; i++) {
      const key = data.Contents[i].Key
      // create presigned url that allows object to be fetched for 7 days
      const opts = { Bucket: BUCKET, Key: key, Expires: 60 * 60 * 24 * 7 }
      const url = await s3.getSignedUrlPromise('getObject', opts)
      const obj = {
        key,
        url
      }
      retval.push(obj)
    }
  } catch (e) {
    console.log('ERROR!', e)
    return { statusCode: 500, body: '{"ok": false}' }

  }
  return { statusCode: 200, body: JSON.stringify({ "ok": true, images: retval, endReached: !data.IsTruncated }) }

}
