//bucket for the code (layer/code zips)
resource "aws_s3_bucket" "photoalbum-code" {
  bucket = "${var.bucket_prefix}-code-${terraform.workspace}"
}

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

#make every bucket name a random string because s3 has a universal namespace
resource "random_string" "bucketName" {
  length           = 20
  special          = false
  upper = false
  lower = true
}

# create the bucket that will host the site
resource "aws_s3_bucket" "photosWebsite" {
  bucket        = random_string.bucketName.result
  force_destroy = true
}

resource "aws_s3_bucket_website_configuration" "photosWebsiteConfig" {
  bucket = aws_s3_bucket.photosWebsite.bucket

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "404.html"
  }
}

resource "aws_s3_bucket_policy" "photosWebsitePolicy" {
  bucket = aws_s3_bucket.photosWebsite.bucket
  policy = <<EOF
{
  "Version": "2008-10-17",
  "Statement": [
    {
      "Sid": "Allow Public Browsing",
      "Effect": "Allow",
      "Principal": {
        "AWS": "*"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::${random_string.bucketName.result}/*"
    }
  ]
}
EOF
}

resource "aws_s3_bucket_ownership_controls" "photosWebsiteControls" {
  bucket = aws_s3_bucket.photosWebsite.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}
resource "aws_s3_bucket_public_access_block" "photosWebsiteAccess" {
  bucket = aws_s3_bucket.photosWebsite.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_acl" "photosWebsiteACL" {
  depends_on = [ aws_s3_bucket_public_access_block.photosWebsiteAccess, 
                aws_s3_bucket_ownership_controls.photosWebsiteControls ]
  bucket = aws_s3_bucket.photosWebsite.bucket
  acl    = "public-read"
}

output "websiteURL" {
  value = aws_s3_bucket_website_configuration.photosWebsiteConfig.website_endpoint
  
}

output "websiteBucket" {
  value = aws_s3_bucket.photosWebsite.bucket
  
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
