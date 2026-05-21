const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const db = require('./db.js');

const REGION = process.env.AWS_REGION || "eu-west-1";
const s3 = new S3Client({ region: REGION });

const THUMB_BUCKET = process.env.THUMB_BUCKET
const LARGE_THUMBS_BUCKET = process.env.LARGE_THUMBS_BUCKET

exports.handler = async function (event) {
  console.log(JSON.stringify(event));
  let key = event.Records[0].s3.object.key;
  if (key.match(/\.mp4$|\.mov$|\.avi$/i)) {
    key = key + ".jpg" //the thumbnail for the video has the same name as the video but with .jpg at the end of it, so add that to get the correct key for the thumbnail
  }
  // delete the thumbnail associated with the deleted image
  try {
    console.log("Deleting thumbnails with key: ", key, " from buckets: ", THUMB_BUCKET, " and ", LARGE_THUMBS_BUCKET);
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
