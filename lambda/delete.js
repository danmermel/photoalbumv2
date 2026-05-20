const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");

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
   const key = spec.queryStringParameters.key
   if (!key) {
     return { statusCode: 400, body: '{"ok": false,"msg": "Missing image key parameter"}' }
   }
   
  const params = {
    Key: key,
    Bucket: BUCKET
  };

  try {
    await s3.send(new DeleteObjectCommand(params));
    return { statusCode: 200, body: '{"ok": true,"msg": "Image Deleted"}' }
  } catch (e) {
    console.log("Error deleting image: ", e)
    return { statusCode: 500, body: '{"ok": false,"msg": "Error deleting image"}' }
  }

}
