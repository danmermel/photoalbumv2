const AWS = require('aws-sdk');
const db = require('./db.js');
const s3 = new AWS.S3({
  signatureVersion: 'v4',
});

const THUMB_BUCKET = process.env.THUMB_BUCKET
const LARGE_THUMBS_BUCKET = process.env.LARGE_THUMBS_BUCKET

exports.handler = async function (event) {
  console.log(JSON.stringify(event));
  const key = event.Records[0].s3.object.key;

  // delete the thumbnail associated with the deleted image
  await s3.deleteObject({ Key: key, Bucket: THUMB_BUCKET }).promise()
  await s3.deleteObject({ Key: key, Bucket: LARGE_THUMBS_BUCKET }).promise()

  //  delete the db data associated with the deleted image
  try {
    const data = await db.read(key)
    console.log(data)
    if (data.Items.length > 0) {
      await db.remove(data.Items)
    }
  } catch (e) {
    console.log("Error removing data from the database: ", e)
  }




}
