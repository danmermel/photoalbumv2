
// DynamoDB images table
resource "aws_dynamodb_table" "photoalbumv2-tags-db" {
  name = "photoalbumv2-tags-${terraform.workspace}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key = "id"
  attribute {
   name = "id"
   type = "S"
  }
  attribute {
   name = "image_id"
   type = "S"
  }
  attribute {
   name = "keyword"
   type = "S"
  }

  global_secondary_index {
    name = "image_id-index"
    hash_key = "image_id"
    projection_type = "ALL"
  }
  global_secondary_index {
    name = "keyword-index"
    hash_key = "keyword"
    projection_type = "ALL"
  }
}

output "dynamoDB"  {
  value = aws_dynamodb_table.photoalbumv2-tags-db.name
}
