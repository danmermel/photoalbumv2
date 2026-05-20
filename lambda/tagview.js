// ...existing code...
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const db = require ("./db.js")

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
      const getCmd = new GetObjectCommand({ Bucket: BUCKET, Key: key })
      const url = await getSignedUrl(s3, getCmd, { expiresIn: 60 * 60 * 24 * 7 })
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
  //base 64 encode the lastevaluatedkey for ease of passing around, but only if it exists
  //if it does not exist, then the end has been reached
  let encoded
  if(response.LastEvaluatedKey){
    encoded = Buffer.from (JSON.stringify(response.LastEvaluatedKey)).toString("base64")

  }
  return { statusCode: 200, body: JSON.stringify({ "ok": true, images: retval, LastEvaluatedKey: encoded }) }

}
// ...existing code...