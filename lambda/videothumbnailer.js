const AWS = require('aws-sdk');
const os = require('os')
const ffmpeg = require('fluent-ffmpeg')

const s3 = new AWS.S3({
  signatureVersion: 'v4',
});

const BUCKET = process.env.BUCKET;
const THUMB_BUCKET = process.env.THUMB_BUCKET;
const LARGE_THUMB_BUCKET = process.env.LARGE_THUMB_BUCKET;

exports.handler = async function (event) {
  console.log(event)
  const key = event.key;
  console.log(`Running on ${bucket}/${key}`)
  // Generate the URL to get key from bucket
  geturl = await S3.getSignedUrlPromise('getObject', { Bucket: bucket, Key: key })

  // create temporary directory
  const tmppath = os.tmpdir

  // run ffmpeg to take a snapshot
  const keyjpg = key + '.jpg'
  const outpath = path.join(tmppath, keyjpg)
  console.log(`path is ${outpath}`)
  const command = ffmpeg()
    .input(geturl)
    .inputOptions('-seekable 0')
    .output(outpath)
    .outputOptions(['-format singlejpeg', '-vframes 1'])
  await run(command, true)

  // copy the temporary file to output bucket
  // upload to S3
  console.log("uploading to s3")
  await S3.putObject({
    Bucket: THUMB_BUCKET,
    Key: keyjpg,
    Body: fs.createReadStream(outpath)
  }).promise()
}