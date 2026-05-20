const { DynamoDBClient, QueryCommand, BatchWriteItemCommand } = require("@aws-sdk/client-dynamodb");

const REGION = process.env.AWS_REGION || "eu-west-1";
const TABLE = process.env.TABLE;

const dynamodb = new DynamoDBClient({ region: REGION });

var read = async function (key) {
  const obj = {
    TableName: TABLE,
    IndexName: "image_id-index",
    KeyConditionExpression: "image_id = :k",
    ExpressionAttributeValues: { ":k": { "S": key } },
    ProjectionExpression: "id"
  };
  return await dynamodb.send(new QueryCommand(obj));
}

var readtags = async function (key) {
  const obj = {
    TableName: TABLE,
    IndexName: "image_id-index",
    KeyConditionExpression: "image_id = :k",
    ExpressionAttributeValues: { ":k": { "S": key } },
    ProjectionExpression: "keyword"
  };
  let resp = await dynamodb.send(new QueryCommand(obj));
  resp = (resp.Items || []).map(function (i) {
    return i.keyword.S;
  });
  return resp;
}

var readkeys = async function (tag, ExclusiveStartKey) {
  const obj = {
    TableName: TABLE,
    IndexName: "keyword-index",
    KeyConditionExpression: "keyword = :k",
    ExpressionAttributeValues: { ":k": { "S": tag } },
    ProjectionExpression: "image_id",
    Limit: 25
  };
  if (ExclusiveStartKey) {
    obj.ExclusiveStartKey = ExclusiveStartKey;
  }

  let resp = await dynamodb.send(new QueryCommand(obj));
  const keys = (resp.Items || []).map(function (i) {
    return i.image_id.S;
  });
  return { keys, LastEvaluatedKey: resp.LastEvaluatedKey };
}

var remove = async function (items) {
  var params = {
    RequestItems: {}
  };

  params.RequestItems[TABLE] = [];

  for (i in items) {
    var item = items[i];
    var obj = {
      DeleteRequest: {
        Key: {
          id: { S: item.id.S }
        }
      }
    };
    params.RequestItems[TABLE].push(obj);
  }

  await dynamodb.send(new BatchWriteItemCommand(params));
}

const write = async function (params) {
  return await dynamodb.send(new BatchWriteItemCommand(params));
}

module.exports = {
  read, readtags, readkeys, remove, write
};
