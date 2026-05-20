// ...existing code...
const { S3Client, GetObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const os = require('os');
const path = require('path');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const { get } = require("http");

const REGION = process.env.AWS_REGION || "eu-west-1";
const s3 = new S3Client({ region: REGION });

const BUCKET = process.env.BUCKET;
const THUMB_BUCKET = process.env.THUMB_BUCKET;
const LARGE_THUMB_BUCKET = process.env.LARGE_THUMB_BUCKET;

function runFfmpeg(command) {
  return new Promise((resolve, reject) => {
    command
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
      .run();
  });
}

exports.handler = async function (event) {
  console.log(event);
  const key = event.key;
  console.log(`Running on ${BUCKET}/${key}`);

  // generate a presigned URL for ffmpeg to fetch the video
  const getCmd = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  const geturl = await getSignedUrl(s3, getCmd, { expiresIn: 60 * 60 * 24 * 7 });
  console.log("url is ", geturl)

  // create temporary directory and out path
  const tmppath = os.tmpdir();
  const keyjpg = `${path.basename(key)}.jpg`;
  const outpath = path.join(tmppath, keyjpg);
  console.log(`path is ${outpath}`);

  // run ffmpeg to take a snapshot
  const command = ffmpeg()
    .input(geturl)
    .inputOptions('-seekable 0')
    .output(outpath)
    .outputOptions(['-format singlejpeg', '-vframes 1']);

  //console.log("command is ", command);
  await runFfmpeg(command);

  // upload the generated thumbnail to S3
  console.log("uploading to s3: ", THUMB_BUCKET, keyjpg);
  console.log("file exists", fs.existsSync(outpath))
  const fileStream = fs.createReadStream(outpath);
  await s3.send(new PutObjectCommand({
    Bucket: THUMB_BUCKET,
    Key: keyjpg,
    Body: fileStream,
    ContentType: 'image/jpeg'
  }));

  // cleanup local file
  try { fs.unlinkSync(outpath); } catch (e) { /* ignore */ }

  return { statusCode: 200, body: '{"ok": true}' };
}
// ...existing code...