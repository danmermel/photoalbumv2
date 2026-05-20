const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const db = require('./db.js');

const REGION = process.env.AWS_REGION || "eu-west-1";
const s3 = new S3Client({ region: REGION });

const THUMB_BUCKET = process.env.THUMB_BUCKET
const LARGE_THUMBS_BUCKET = process.env.LARGE_THUMBS_BUCKET

exports.handler = async function (event) {
  console.log(JSON.stringify(event));
  const key = event.Records[0].s3.object.key;

  // delete the thumbnail associated with the deleted image
  try {
    await s3.send(new DeleteObjectCommand({ Key: key, Bucket: THUMB_BUCKET }));
    await s3.send(new DeleteObjectCommand({ Key: key, Bucket: LARGE_THUMBS_BUCKET }));
  } catch (e) {
    console.log("Error deleting thumbnails: ", e);
  }

  // delete the db data associated with the deleted image
  try {
    const data = await db.read(key);
    console.log(data);
    if (data.Items && data.Items.length > 0) {
      await db.remove(data.Items);
    }
  } catch (e) {
    console.log("Error removing data from the database: ", e);
  }
}
