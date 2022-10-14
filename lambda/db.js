var AWS = require('aws-sdk')

var dynamodb = new AWS.DynamoDB({ "region": "eu-west-1" });

const TABLE = process.env.TABLE

var docClient = new AWS.DynamoDB.DocumentClient()

var read = async function (key) {
  var obj = {
    TableName: TABLE,
    IndexName: "image_id-index",
    KeyConditionExpression: "image_id = :k",
    ExpressionAttributeValues: { ":k": { "S": key } },
    ProjectionExpression: "id"
  }
  return await dynamodb.query(obj).promise();
}

var readtags = async function (key) {
  const obj = {
    TableName: TABLE,
    IndexName: "image_id-index",
    KeyConditionExpression: "image_id = :k",
    ExpressionAttributeValues: { ":k": { "S": key } },
    ProjectionExpression: "keyword"
  }
  let resp =  await dynamodb.query(obj).promise();
  resp = resp.Items.map(function (i){
    return i.keyword.S
  })
  return resp
}

var remove = async function (items) {

  //this is the object  you have to build to insert into dynamodb
  var params = {
    RequestItems: {}
  }

  params.RequestItems[TABLE] = []

  for (i in items) {
    var item = items[i];
    var obj = {
      DeleteRequest: {
        Key: {
          id: { S: item.id.S }
        }
      }
    }
    params.RequestItems[TABLE].push(obj)
  }
  console.log(params);
  
  await dynamodb.batchWriteItem(params).promise();
}

const write = async function(params) {
  return await dynamodb.batchWriteItem(params).promise()
}

module.exports = {
  read, readtags, remove, write
};
