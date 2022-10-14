const AWS = require('aws-sdk');
const db = require('./db.js');
const rekognition = new AWS.Rekognition({ "region": "eu-west-1" });
const BUCKET = process.env.BUCKET
const TABLE = process.env.TABLE

// prepare our tags and location data into a form required for DynamoDB insertion
function prepareData(image_id, data, locarray) {

  var kuuid = require('kuuid')
  //add the location words received, if any
  var wordList = locarray.map (function (e){
    return {"name": e, "confidence": 100}
  })
  console.log("preparing data:")
  console.log(image_id)
  console.log(data)
  for (var i in data.Labels) {
    wordList.push({ name: data.Labels[i].Name.toLowerCase(), confidence: data.Labels[i].Confidence })
    //if (data.Labels[i].Parents){
    //    data.Labels[i].Parents.map(function(s) {
    //    wordList.push({ name: s.Name.toLowerCase(), confidence: data.Labels[i].Confidence})
    //  })
    // } 
  }
  console.log("wordlist is ", wordList)
  //sorts the list by confidence
  wordList = wordList.sort(function (a, b) {
    if (a.confidence < b.confidence) {
      return 1
    } else if (a.confidence > b.confidence) {
      return -1
    } else {
      return 0
    }
  })

  //this is the object  you have to build to insert into dynamodb
  var params = {
    RequestItems: {}
  }

  params.RequestItems[TABLE] = []

  //this array contains the words we have already inserted, so that we don't insert it again
  var dedupelist = []
  for (i in wordList) {
    if (dedupelist.indexOf(wordList[i].name) === -1) {   //i.e.the word is not yet in the array
      var album = image_id.match(/(^.*)\//)[1];  //gets the album name
      var obj = {
        PutRequest: {
          Item: {
            id: { S: kuuid.id() },
            album: { S: album },
            keyword: { S: wordList[i].name },
            confidence: { N: wordList[i].confidence.toString() },
            image_id: { S: image_id }
          }
        }
      }
      params.RequestItems[TABLE].push(obj)
      if (params.RequestItems[TABLE].length == 25) {
        break  // limit of things you can write to the db has been reached. Stop adding...
      }
      dedupelist.push(wordList[i].name)
    }
  }
  return params
}

exports.handler = async function (event) {

  console.log(JSON.stringify(event));
  const key = event.key;
  const locarray = event.locarray;
  console.log("key is ", key);
  console.log("locarray is ", locarray)

  //first see if the object has already been reko-gnised

  const data = await db.read(key)

  if (data.Count > 0) {
    console.log("previously reko-gnised. Ignoring");
    return;
  }

  console.log("not previously reko-gnised")
  var rekoParams = {
    Image: {
      S3Object: {
        Bucket: BUCKET,
        Name: key
      }
    },
    MaxLabels: 50,
    MinConfidence: 50
  };
  console.log(rekoParams)
  const labels = await rekognition.detectLabels(rekoParams).promise()
  //prepare data for insertion
  const params = prepareData(key, labels, locarray);
  //console.log(JSON.stringify(params));
  //call dynamodb to save the data
  await db.write(params)
}