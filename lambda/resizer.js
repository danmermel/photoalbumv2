// ...existing code...
const { GetObjectCommand, PutObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const { LambdaClient, InvokeCommand } = require("@aws-sdk/client-lambda");
const exifr = require('exifr')
const latlongify = require('latlongify')

const sharp = require('sharp');
const fs = require('fs');

const REGION = process.env.AWS_REGION || "eu-west-1";

const s3 = new S3Client({ region: REGION });
const lambda = new LambdaClient({ region: REGION });

const BUCKET = process.env.BUCKET;
const THUMB_BUCKET = process.env.THUMB_BUCKET;
const LARGE_THUMB_BUCKET = process.env.LARGE_THUMB_BUCKET;
const REKO_LAMBDA = process.env.REKO_LAMBDA;
const VIDEO_THUMBNAILER_LAMBDA = process.env.VIDEO_THUMBNAILER_LAMBDA

// helper to convert various Body types to Buffer
async function streamToBuffer(stream) {
  return await new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

async function toBuffer(body) {
  if (!body) return Buffer.alloc(0);
  // Uint8Array covers Buffer in Node 12+
  if (body instanceof Uint8Array) return Buffer.from(body);
  if (body && typeof body.pipe === 'function') return await streamToBuffer(body);
  // fallback
  return Buffer.from(body);
}

exports.handler = async function (event) {

  console.log(JSON.stringify(event));
  if (event.Records[0].s3.object.size > 0) {
    const key = event.Records[0].s3.object.key;
    if (key.match(/\.jpg$|\.png$|\.jpeg$|\.webp$/i)) {      // it is a jpg or png so make a thumbnail
      console.log('loading original image')
      const getResp = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
      const s3objBody = await toBuffer(getResp.Body);

      console.log('creating small thumbnail')
      let resizedimg = await sharp(s3objBody)
        .rotate()
        .resize(200, 200)
        .toFormat('jpg')
        .toBuffer()
      console.log('writing small thumbnail to S3')
      await s3.send(new PutObjectCommand({
        Body: resizedimg,
        Bucket: THUMB_BUCKET,
        ACL: "private",
        ContentType: 'image/jpg',
        Key: key,
      }))

      // create a larger version of the thumbnail, preserving the aspect ratio
      console.log('creating large thumbnail')
      resizedimg = await sharp(s3objBody)
        .rotate()
        .resize({ width: 1500, height: 1500, fit: 'inside' })
        .toFormat('jpg')
        .toBuffer()
      console.log('writing large thumbnail to S3')
      await s3.send(new PutObjectCommand({
          Body: resizedimg,
          Bucket: LARGE_THUMB_BUCKET,
          ACL: "private",
          ContentType: 'image/jpg',
          Key: key,
        }))

      //we have the image, so now extract the exif data 
      console.log('parse the EXIF data')
      const exifdata = await exifr.parse(s3objBody)
      //then if the exif contains lat/long then call the latlongify one
      let locarray = []
      if (exifdata && exifdata.latitude) {
        console.log('exif data', exifdata)
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

      console.log("location data", locarray);
      //now sending it to reko for keyword recognition
      console.log("invoke reko");
      await lambda.send(new InvokeCommand({
        FunctionName: REKO_LAMBDA,
        Payload: Buffer.from(JSON.stringify({ key, locarray }))
      }));
      console.log("invoked reko lambda with key ", key, "and lambda name ", REKO_LAMBDA)

    } else {  // not a jpg so it's  a video (because frontend has filtered out everytrhging else)
       console.log("invoke videothumb lambda");
      await lambda.send(new InvokeCommand({
        FunctionName: VIDEO_THUMBNAILER_LAMBDA,
        Payload: Buffer.from(JSON.stringify({ key }))
      }));      

    }
  }
}
// ...existing code...