
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
  //check album name is valid
  if (!album.match(/^[a-zA-Z0-9_]+$/)) {
    return { statusCode: 400, body: '{"ok": false,"msg": "Invalid album name. Only letters, numbers and underscore allowed. No spaces"}' }
  }
  //now check if the album already exists
  const params = {
    Key: album + "/",
    Bucket: BUCKET
  };
  try {

    await s3.headObject(params).promise()
    return { statusCode: 409, body: '{"ok": false,"msg": "Album name already exists"}' }
  } catch (e) {
    //console.log("e is ", e)
    //do nothing
    //console.log("Bucket does not exist.. creating...")
  }
  // if you get here, create the bucket
  try {
    await s3.putObject(params).promise()
    return { statusCode: 200, body: '{"ok": true,"msg": "Album created"}' }
  } catch (e) {
    //console.log("Error creating album: ", e)
    return { statusCode: 500, body: '{"ok": false,"msg": "Error creating album:"}' }
  }

}
