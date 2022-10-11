const AWS = require('aws-sdk');
const exifr = require('exifr')
const latlongify = require('latlongify')

const s3 = new AWS.S3({
  signatureVersion: 'v4',
});
const lambda = new AWS.Lambda({ "region": "eu-west-1" });

const sharp = require('sharp');
const fs = require('fs');

const BUCKET = process.env.BUCKET;
const THUMB_BUCKET = process.env.THUMB_BUCKET;
const REKO_LAMBDA = process.env.REKO_LAMBDA;

exports.handler = async function (event) {

  console.log(JSON.stringify(event));
  if (event.Records[0].s3.object.size > 0) {
    const key = event.Records[0].s3.object.key;
    if (key.match(/\.jpg$|\.png$|\.jpeg$|\.webp$/i)) {      // it is a jpg or png so make a thumbnail
      const s3obj = await s3.getObject({ Bucket: BUCKET, Key: key }).promise()

      const resizedimg = await sharp(s3obj.Body)
        .resize(200, 200)
        .toFormat('jpg')
        .toBuffer()

      await s3.putObject({
        Body: resizedimg,
        Bucket: THUMB_BUCKET,
        ACL: "private",
        ContentType: 'image/jpg',
        Key: key,
      }).promise()

      //we have the image, so now extract the exif data 
      const exifdata = await exifr.parse(s3obj.Body)
      //then if the exif contains lat/long then call the latlongify one
      let locarray = []
      if (exifdata && exifdata.latitude) {
        const locdata = await latlongify.find(exifdata.latitude, exifdata.longitude)
        if (locdata.country) {
          locarray.push(locdata.country.code)
        }
        if (locdata.state) {
          locarray.push(locdata.state.name)
        }
        if (locdata.county) {
          locarray.push(locdata.county.name)
        }
        if (locdata.city) {
          locarray.push(locdata.city.name)
        }
      }
      //pass an array of strings with country, town, state etc to reko for adding to db

      console.log("written to s3!");
      //now sending it to reko for keyword recognition
      await lambda.invoke({
        "FunctionName": REKO_LAMBDA,
        "Payload": JSON.stringify({
          key, locarray
        })
      }).promise();
      console.log("invoked reko lambda with key ", key, "and lambda name ", REKO_LAMBDA)

    } else {  // not a jpg so insert a placeholder image
      console.log("inserting placeholder...")
      const file = fs.readFileSync('./play.jpg');
      await s3.putObject({
        Body: file,
        Bucket: THUMB_BUCKET,
        ACL: "private",
        ContentType: 'image/jpg',
        Key: key,
      }).promise()
    }
  }
}
