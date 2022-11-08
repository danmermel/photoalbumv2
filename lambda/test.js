const AWS = require('aws-sdk');

process.env.TABLE = "photoalbumv2-tags-stage"
const db = require ("./db.js")

async function main (){

    const response = await db.readkeys("person",{
        id: { S: '001oiX0220UGmn2KhPIV1XPhDy0RzW08' },
        keyword: { S: 'person' }
      })
    console.log(response)
}

main()