resource "aws_lambda_function" "lambda" {
  filename      = var.filename
  function_name = var.function_name
  role          = var.role
  handler       = var.handler
  runtime = var.runtime
  timeout = var.timeout
  source_code_hash = filebase64sha256(var.filename)
  environment {
    variables = var.env_variables
  }
}

resource "aws_cloudwatch_log_group" "LG" {
  name              = "/aws/lambda/${aws_lambda_function.lambda.function_name}"
  retention_in_days = 7
}

resource "aws_lambda_function_url" "FunctionUrl" {
  function_name      = aws_lambda_function.lambda.function_name
  authorization_type = "NONE"
  cors {
    allow_credentials = true
    allow_origins     = ["*"]
    allow_methods     = ["*"]
    max_age           = 86400
  }
}

output "FunctionUrl" {
  value = aws_lambda_function_url.FunctionUrl.function_url
}