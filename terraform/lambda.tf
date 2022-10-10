//zip up all js files for the pipeline
data "archive_file" "lambda" {
  type        = "zip"
  source_dir  = "../lambda"
  output_path = "../lambda.zip"
}

// create the lambda functions
// the source_code_hash bit makes a hash of the file you want to upload. If the hash is different from the
// last time you uploaded (i.e. you changed the lambda code), then it uploads it again. But if not, it ignores it. Neat!
// Not so good if you have more complicated scenarios because here you have the code and the infra in one place... if you want 
//more separation you need a more complicated setup, e.g. https://johnroach.io/2020/09/04/deploying-lambda-functions-with-terraform-just-dont/ 

resource "aws_lambda_function" "reko" {
  filename      = data.archive_file.lambda.output_path
  function_name = "rekov2-${terraform.workspace}"
  role          = aws_iam_role.lambda_role.arn
  handler       = "reko.handler"
  runtime = "nodejs16.x"
  timeout = 10
  source_code_hash = filebase64sha256(data.archive_file.lambda.output_path)

  environment {
    variables = {
      BUCKET = aws_s3_bucket.photoalbum-images.id
      TABLE = aws_dynamodb_table.photoalbumv2-tags-db.id
    }
  }
}

resource "aws_cloudwatch_log_group" "lambdaLGreko" {
  name              = "/aws/lambda/${aws_lambda_function.reko.function_name}"
  retention_in_days = 7
}


# resource "aws_lambda_function" "photoalbum_remover" {
#   filename      = "../lambda/remover/remover.zip"
#   function_name = "photoalbum_remover"
#   role          = aws_iam_role.reko_role.arn
#   handler       = "index.handler"
#   runtime = "nodejs12.x"
#   timeout = 10
#   source_code_hash = filebase64sha256("../lambda/remover/remover.zip")

#   environment {
#     variables = {
#       TABLE = aws_dynamodb_table.photoalbum-images-db.id
#     }
#   }
# }

# output "removerLambda"  {
#   value = aws_lambda_function.photoalbum_remover.function_name
# }

resource "aws_lambda_function" "resizer" {
  filename      = data.archive_file.lambda.output_path
  function_name = "resizerv2-${terraform.workspace}"
  role          = aws_iam_role.lambda_role.arn
  handler       = "resizer.handler"
  runtime = "nodejs16.x"
  timeout = 10
  source_code_hash = filebase64sha256(data.archive_file.lambda.output_path)


  environment {
    variables = {
      THUMB_BUCKET = aws_s3_bucket.photoalbum-thumbs.id
      BUCKET = aws_s3_bucket.photoalbum-images.id
      REKO_LAMBDA = aws_lambda_function.reko.id
    }
  }
}

resource "aws_cloudwatch_log_group" "lambdaLGresizer" {
  name              = "/aws/lambda/${aws_lambda_function.resizer.function_name}"
  retention_in_days = 7
}

output "resizeLambda"  {
  value = aws_lambda_function.resizer.function_name
}


resource "aws_lambda_function" "listAlbumsAPI" {
  filename      = data.archive_file.lambda.output_path
  function_name = "listalbumsv2-${terraform.workspace}"
  role          = aws_iam_role.lambda_role.arn
  handler       = "listalbums.handler"
  runtime = "nodejs16.x"
  timeout = 10
  source_code_hash = filebase64sha256(data.archive_file.lambda.output_path)


  environment {
    variables = {
      BUCKET = aws_s3_bucket.photoalbum-images.id
      API_KEY = var.API_KEY
    }
  }
}

resource "aws_cloudwatch_log_group" "lambdaLGlistAlbumsAPI" {
  name              = "/aws/lambda/${aws_lambda_function.listAlbumsAPI.function_name}"
  retention_in_days = 7
}

resource "aws_lambda_function_url" "listAlbumsAPIFunctionUrl" {
  function_name      = aws_lambda_function.listAlbumsAPI.function_name
  authorization_type = "NONE"
  cors {
    allow_credentials = true
    allow_origins     = ["*"]
    allow_methods     = ["*"]
    max_age           = 86400
  }
}

output "listAlbumsAPIFunctionUrl" {
  value = aws_lambda_function_url.listAlbumsAPIFunctionUrl.function_url
}


// give s3 permission to execute lambda

# resource "aws_lambda_permission" "allow_s3_reko" {
#   statement_id  = "AllowS3ToExecuteReko"
#   action        = "lambda:InvokeFunction"
#   function_name = aws_lambda_function.photoalbum_reko.function_name
#   principal     = "s3.amazonaws.com"
#   source_arn    = aws_s3_bucket.photoalbum-images.arn
# }

# resource "aws_lambda_permission" "allow_s3_remover" {
#   statement_id  = "AllowS3ToExecuteRemover"
#   action        = "lambda:InvokeFunction"
#   function_name = aws_lambda_function.photoalbum_remover.function_name
#   principal     = "s3.amazonaws.com"
#   source_arn    = aws_s3_bucket.photoalbum-images.arn
# }

resource "aws_lambda_permission" "allow_s3_resizer" {
  statement_id  = "AllowS3ToExecuteResizer"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.resizer.function_name
  principal     = "s3.amazonaws.com"
  source_arn    = aws_s3_bucket.photoalbum-images.arn
}
