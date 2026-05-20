const { S3Client, HeadObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");

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
    await s3.send(new HeadObjectCommand(params));
    return { statusCode: 409, body: '{"ok": false,"msg": "Album name already exists"}' }
  } catch (e) {
    // If the object is not found we get a 404/NotFound — continue to create.
    // For other errors, return a 500.
    const isNotFound = e.name === 'NotFound' || (e.$metadata && e.$metadata.httpStatusCode === 404);
    if (!isNotFound) {
      console.error("Error checking album existence:", e);
      return { statusCode: 500, body: '{"ok": false,"msg": "Error checking album"}' }
    }
  }
  // if you get here, create the album placeholder object
  try {
    await s3.send(new PutObjectCommand(params));
    return { statusCode: 200, body: '{"ok": true,"msg": "Album created"}' }
  } catch (e) {
    console.error("Error creating album:", e)
    return { statusCode: 500, body: '{"ok": false,"msg": "Error creating album:"}' }
  }

}
