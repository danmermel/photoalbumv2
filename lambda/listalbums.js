const { S3Client, ListObjectsV2Command } = require("@aws-sdk/client-s3");

const REGION = process.env.AWS_REGION || "eu-west-1";
const s3 = new S3Client({ region: REGION });

const BUCKET = process.env.BUCKET;
const API_KEY = process.env.API_KEY;

exports.handler = async function (spec) {

  // first check if the API KEY is correct
  if (!spec.queryStringParameters || !spec.queryStringParameters.apikey || spec.queryStringParameters.apikey !== API_KEY) {
    return { statusCode: 401, body: '{"ok": false}' };
  }

  try {
    const params = { Bucket: BUCKET, Delimiter: '/' };
    const data = await s3.send(new ListObjectsV2Command(params));
    const prefixes = data.CommonPrefixes || [];
    const albums = prefixes.map(function (commonPrefix) {
      return decodeURIComponent((commonPrefix.Prefix || '').replace(/\//g, ''));
    });
    return { statusCode: 200, body: JSON.stringify({ "ok": true, albums }) };
  } catch (e) {
    console.error("Error listing albums:", e);
    return { statusCode: 500, body: '{"ok": false}' };
  }
}
