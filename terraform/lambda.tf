//zip up all js files for the API
data "archive_file" "lambda" {
  source_dir  = "../lambda"
  type     = "zip"
  output_path = "../lambda.zip"
  excludes = [ "node_modules", "nodejs", "nodejs-stage.zip", "nodejs-prod.zip"]
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
  layers = [aws_lambda_layer_version.nodeModulesLambdaLayer.arn]

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
  memory_size = 1024
  timeout = 30
  source_code_hash = filebase64sha256(data.archive_file.lambda.output_path)
  layers = [aws_lambda_layer_version.nodeModulesLambdaLayer.arn]
  environment {
    variables = {
      THUMB_BUCKET = aws_s3_bucket.photoalbum-thumbs.id
      LARGE_THUMB_BUCKET = aws_s3_bucket.photoalbum-large-thumbs.id
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

//lambda that gets triggered by an image deletion and removes thumbnail and db data
resource "aws_lambda_function" "remover" {
  filename      = data.archive_file.lambda.output_path
  function_name = "removerv2-${terraform.workspace}"
  role          = aws_iam_role.lambda_role.arn
  handler       = "remover.handler"
  runtime = "nodejs16.x"
  timeout = 10
  source_code_hash = filebase64sha256(data.archive_file.lambda.output_path)
  layers = [aws_lambda_layer_version.nodeModulesLambdaLayer.arn]

  environment {
    variables = {
      THUMB_BUCKET = aws_s3_bucket.photoalbum-thumbs.id
      LARGE_THUMBS_BUCKET = aws_s3_bucket.photoalbum-large-thumbs.id
      TABLE = aws_dynamodb_table.photoalbumv2-tags-db.id
    }
  }
}

resource "aws_cloudwatch_log_group" "lambdaLGremover" {
  name              = "/aws/lambda/${aws_lambda_function.remover.function_name}"
  retention_in_days = 7
}

output "removeLambda"  {
  value = aws_lambda_function.remover.function_name
}

// List Albums API
module "listAlbumsAPI" {
  source        = "./modules/lambdaPackage"
  filename      = data.archive_file.lambda.output_path
  function_name = "listalbumsv2-${terraform.workspace}"
  role          = aws_iam_role.lambda_role.arn
  handler       = "listalbums.handler"
  layers = [aws_lambda_layer_version.nodeModulesLambdaLayer.arn]
  env_variables = {
    BUCKET = aws_s3_bucket.photoalbum-images.id
    API_KEY = var.API_KEY
  }
}

output "listAlbumsAPIFunctionUrl" {
  value = module.listAlbumsAPI.FunctionUrl
}

// Single Album API
module "singleAlbumAPI" {
  source        = "./modules/lambdaPackage"
  filename      = data.archive_file.lambda.output_path
  function_name = "singlealbumv2-${terraform.workspace}"
  role          = aws_iam_role.lambda_role.arn
  handler       = "singlealbum.handler"
  layers = [aws_lambda_layer_version.nodeModulesLambdaLayer.arn]
  env_variables = {
    BUCKET = aws_s3_bucket.photoalbum-thumbs.id
    API_KEY = var.API_KEY
  }
}

output "singleAlbumAPIFunctionUrl" {
  value = module.singleAlbumAPI.FunctionUrl
}

// Single Image API
module "singleImageAPI" {
  source        = "./modules/lambdaPackage"
  filename      = data.archive_file.lambda.output_path
  function_name = "singleimagev2-${terraform.workspace}"
  role          = aws_iam_role.lambda_role.arn
  handler       = "singleimage.handler"
  layers = [aws_lambda_layer_version.nodeModulesLambdaLayer.arn]
  env_variables = {
    BUCKET = aws_s3_bucket.photoalbum-images.id
    LARGE_THUMBS_BUCKET = aws_s3_bucket.photoalbum-large-thumbs.id
    API_KEY = var.API_KEY
    TABLE = aws_dynamodb_table.photoalbumv2-tags-db.name
  }
}

output "singleImageAPIFunctionUrl" {
  value = module.singleImageAPI.FunctionUrl
}

// Create Album API
module "createAlbumAPI" {
  source        = "./modules/lambdaPackage"
  filename      = data.archive_file.lambda.output_path
  function_name = "createalbumv2-${terraform.workspace}"
  role          = aws_iam_role.lambda_role.arn
  handler       = "createalbum.handler"
  layers = [aws_lambda_layer_version.nodeModulesLambdaLayer.arn]
  env_variables = {
    BUCKET = aws_s3_bucket.photoalbum-images.id
    API_KEY = var.API_KEY
  }
}

output "createAlbumAPIFunctionUrl" {
  value = module.createAlbumAPI.FunctionUrl
}

// Delete Album API
module "deleteAlbumAPI" {
  source        = "./modules/lambdaPackage"
  filename      = data.archive_file.lambda.output_path
  function_name = "deletealbumv2-${terraform.workspace}"
  role          = aws_iam_role.lambda_role.arn
  handler       = "deletealbum.handler"
  layers = [aws_lambda_layer_version.nodeModulesLambdaLayer.arn]
  env_variables = {
    BUCKET = aws_s3_bucket.photoalbum-images.id
    API_KEY = var.API_KEY
  }
}

output "deleteAlbumAPIFunctionUrl" {
  value = module.deleteAlbumAPI.FunctionUrl
}

// Upload image API
module "uploadAPI" {
  source        = "./modules/lambdaPackage"
  filename      = data.archive_file.lambda.output_path
  function_name = "uploadv2-${terraform.workspace}"
  role          = aws_iam_role.lambda_role.arn
  handler       = "upload.handler"
  layers = [aws_lambda_layer_version.nodeModulesLambdaLayer.arn]
  env_variables = {
    BUCKET = aws_s3_bucket.photoalbum-images.id
    API_KEY = var.API_KEY
  }
}

output "uploadAPIFunctionUrl" {
  value = module.uploadAPI.FunctionUrl
}

// Delete image API
module "deleteAPI" {
  source        = "./modules/lambdaPackage"
  filename      = data.archive_file.lambda.output_path
  function_name = "deletev2-${terraform.workspace}"
  role          = aws_iam_role.lambda_role.arn
  handler       = "delete.handler"
  layers = [aws_lambda_layer_version.nodeModulesLambdaLayer.arn]
  env_variables = {
    BUCKET = aws_s3_bucket.photoalbum-images.id
    API_KEY = var.API_KEY
  }
}

output "deleteAPIFunctionUrl" {
  value = module.deleteAPI.FunctionUrl
}

// ag View API
module "tagViewAPI" {
  source        = "./modules/lambdaPackage"
  filename      = data.archive_file.lambda.output_path
  function_name = "tagviewv2-${terraform.workspace}"
  role          = aws_iam_role.lambda_role.arn
  handler       = "tagview.handler"
  layers = [aws_lambda_layer_version.nodeModulesLambdaLayer.arn]
  env_variables = {
    BUCKET = aws_s3_bucket.photoalbum-thumbs.id
    API_KEY = var.API_KEY
    TABLE = aws_dynamodb_table.photoalbumv2-tags-db.name
  }
}

output "tagViewAPIFunctionUrl" {
  value = module.tagViewAPI.FunctionUrl
}

// give s3 permission to execute lambda

# resource "aws_lambda_permission" "allow_s3_reko" {
#   statement_id  = "AllowS3ToExecuteReko"
#   action        = "lambda:InvokeFunction"
#   function_name = aws_lambda_function.photoalbum_reko.function_name
#   principal     = "s3.amazonaws.com"
#   source_arn    = aws_s3_bucket.photoalbum-images.arn
# }

resource "aws_lambda_permission" "allow_s3_remover" {
  statement_id  = "AllowS3ToExecuteRemover"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.remover.function_name
  principal     = "s3.amazonaws.com"
  source_arn    = aws_s3_bucket.photoalbum-images.arn
}

resource "aws_lambda_permission" "allow_s3_resizer" {
  statement_id  = "AllowS3ToExecuteResizer"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.resizer.function_name
  principal     = "s3.amazonaws.com"
  source_arn    = aws_s3_bucket.photoalbum-images.arn
}
