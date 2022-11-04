//bucket for the photos
resource "aws_s3_bucket" "photoalbum-images" {
  bucket = "${var.bucket_prefix}-images-${terraform.workspace}"
}

resource "aws_s3_bucket_cors_configuration" "photoalbum-images-cors" {
  bucket = aws_s3_bucket.photoalbum-images.id
  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["PUT", "POST", "DELETE", "HEAD", "GET"]
    allowed_origins = ["*"]
    expose_headers  = ["ETag"]
  }
}

output "photoBucket" {
  value = aws_s3_bucket.photoalbum-images.id
}

//bucket for the thumbnails
resource "aws_s3_bucket" "photoalbum-thumbs" {
  bucket = "${var.bucket_prefix}-thumbs-${terraform.workspace}"
}

output "thumbBucket" {
  value = aws_s3_bucket.photoalbum-thumbs.id
}

//bucket for the larger (high res) thumbnails
resource "aws_s3_bucket" "photoalbum-large-thumbs" {
  bucket = "${var.bucket_prefix}-large-thumbs-${terraform.workspace}"
}

output "largeThumbBucket" {
  value = aws_s3_bucket.photoalbum-large-thumbs.id
}

//trigger resizer from s3
resource "aws_s3_bucket_notification" "photoalbum-triggers" {
  bucket = aws_s3_bucket.photoalbum-images.id

  lambda_function {
    lambda_function_arn = aws_lambda_function.resizer.arn
    events              = ["s3:ObjectCreated:*"]
  }

  lambda_function {
    lambda_function_arn = aws_lambda_function.remover.arn
    events        = ["s3:ObjectRemoved:*"]
  }

  depends_on = [
    aws_lambda_permission.allow_s3_remover,
    aws_lambda_permission.allow_s3_resizer
  ]
}
