
const AWS = require('aws-sdk');
const s3 = new AWS.S3({
  signatureVersion: 'v4',
});

const BUCKET = process.env.BUCKET;
const API_KEY = process.env.API_KEY;

exports.handler = async function (spec) {

  let albums;  
  // first check if the API KEY is correct
  if (!spec.queryStringParameters || !spec.queryStringParameters.apikey || spec.queryStringParameters.apikey !== API_KEY) {
    return { statusCode: 401, body: '{"ok": false}' }
  }
  try {
    const data = await s3.listObjects({ Delimiter: '/', Bucket: BUCKET }).promise();
    // console.log("data is ", data)
    albums = data.CommonPrefixes.map(function (commonPrefix) {
      return decodeURIComponent(commonPrefix.Prefix.replace('/', ''));
    })
  } catch (e) {
    return { statusCode: 500, body: '{"ok": false}' }

  }
  return { statusCode: 200, body: JSON.stringify({"ok": true, albums}) }

}
