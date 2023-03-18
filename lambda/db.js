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

var readkeys = async function (tag, ExclusiveStartKey) {
  const obj = {
    TableName: TABLE,
    IndexName: "keyword-index",
    KeyConditionExpression: "keyword = :k",
    ExpressionAttributeValues: { ":k": { "S": tag } },
    ProjectionExpression: "image_id",
    Limit: 25
  }
  //if this param is supplied (for pagination of results) we pass it in.
  if (ExclusiveStartKey) {
    obj.ExclusiveStartKey = ExclusiveStartKey
  }

  let resp =  await dynamodb.query(obj).promise();
  const keys = resp.Items.map(function (i){
    return i.image_id.S
  })
  return {keys, LastEvaluatedKey: resp.LastEvaluatedKey} 
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
  //console.log(params);
  
  await dynamodb.batchWriteItem(params).promise();
}

const write = async function(params) {
  return await dynamodb.batchWriteItem(params).promise()
}

module.exports = {
  read, readtags, readkeys, remove, write
};
