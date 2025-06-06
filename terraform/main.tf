data "aws_region" "current" {}
data "aws_caller_identity" "current" {}

data "aws_iam_policy" "AmazonDynamoDBFullAccess" {
  arn = "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess"
}

data "aws_iam_policy" "AmazonRekognitionFullAccess" {
  arn = "arn:aws:iam::aws:policy/AmazonRekognitionFullAccess"
}

data "aws_iam_policy" "AmazonS3FullAccess" {
  arn = "arn:aws:iam::aws:policy/AmazonS3FullAccess"
}

data "aws_iam_policy" "AmazonDynamoDBReadOnlyAccess" {
  arn = "arn:aws:iam::aws:policy/AmazonDynamoDBReadOnlyAccess"
}


provider "aws" {
  region = "eu-west-1"
}

terraform {
  backend "s3" {
    bucket = "photoalbumv2-terraform"
    key = "state"
    region = "eu-west-1"
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

output "awsRegion"  {
  value = data.aws_region.current.name
}
