
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
   
  const params = {
    Key: key,
    Bucket: BUCKET
  };

  try {
    await s3.deleteObject(params).promise()
    return { statusCode: 200, body: '{"ok": true,"msg": "Image Deleted"}' }
  } catch (e) {
    console.log("Error creating album: ", e)
    return { statusCode: 500, body: '{"ok": false,"msg": "Error deleting image"}' }
  }

}
