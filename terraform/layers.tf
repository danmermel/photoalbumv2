// zip up the directory that has all the node modules
data "archive_file" "nodeModulesZip" {
  type        = "zip"
  source_dir  = "../lambda/nodejs"
  output_path = "../lambda/nodejs-${terraform.workspace}.zip"
}

// upload the zip to s3
resource "aws_s3_object" "nodeModulesS3Zip" {
  bucket = aws_s3_bucket.photoalbum-code.id
  key    = "nodejs-${terraform.workspace}.zip"
  source = data.archive_file.nodeModulesZip.output_path
  etag   = filemd5(data.archive_file.nodeModulesZip.output_path)
}

# create the nodejs layer for the API
resource "aws_lambda_layer_version" "nodeModulesLambdaLayer" {
  layer_name          = "nodeModulesLambdaLayer-${terraform.workspace}"
  s3_bucket           = aws_s3_bucket.photoalbum-code.id
  s3_key              = aws_s3_object.nodeModulesS3Zip.id
  source_code_hash    = data.archive_file.nodeModulesZip.output_base64sha256
  compatible_runtimes = [var.node_version]
}