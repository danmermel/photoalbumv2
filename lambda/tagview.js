
const AWS = require('aws-sdk');
const s3 = new AWS.S3({
  signatureVersion: 'v4',
});
const db = require ("./db.js")

const BUCKET = process.env.BUCKET;
const API_KEY = process.env.API_KEY;

exports.handler = async function (spec) {

  // first check if the API KEY is correct
  if (!spec.queryStringParameters || !spec.queryStringParameters.apikey || spec.queryStringParameters.apikey !== API_KEY) {
    return { statusCode: 401, body: '{"ok": false}' }
  }

  // get query string parameters
  const tag = spec.queryStringParameters.tag
  if (!tag) {
    return { statusCode: 400, body: '{"ok": false,"msg": "Missing tag parameter"}' }
  }
  let response
  let retval = []

  try {
    let unencoded
    if(spec.queryStringParameters.LastEvaluatedKey){
      //it will be base64 encoded, so have to unencode it before using
      unencoded = JSON.parse(Buffer.from(spec.queryStringParameters.LastEvaluatedKey,"base64").toString())
    }

    response = await db.readkeys(tag, unencoded)
    const keys =  response.keys

    for (var i = 0; i < keys.length; i++) {
      const key = keys[i]
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
  //base 64 encode the lastevaluatedkey for ease of passing around
  const encoded = Buffer.from (JSON.stringify(response.LastEvaluatedKey)).toString("base64")
  return { statusCode: 200, body: JSON.stringify({ "ok": true, images: retval, LastEvaluatedKey: encoded }) }

}
