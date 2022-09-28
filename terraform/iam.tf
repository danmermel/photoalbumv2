// the role that will be running the lambdas and accessing the buckets and db
resource "aws_iam_role" "lambda_role" {
  name = "photoalbumv2_lambda_role-${terraform.workspace}"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF

}

# //add inline policy that allows writing to logs and invoking lambda functions

resource "aws_iam_role_policy" "inline_policy" {
  name = "inline_policy-${terraform.workspace}"
  role = aws_iam_role.lambda_role.id

  policy = <<-EOF
  {
    "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": [
                    "logs:CreateLogGroup",
                    "logs:CreateLogStream",
                    "logs:PutLogEvents"
                ],
                "Resource": "arn:aws:logs:*:*:*"
            },
            { 
                "Effect": "Allow", 
                "Action": [ "lambda:InvokeFunction" ], 
                "Resource": ["*"] }

        ]
  }
  EOF
}

# //add managed policies that allow access to db, reko and s3
# //these could definitely be more restrictive

# resource "aws_iam_role_policy_attachment" "dynamodb_policy" {
#   role       = aws_iam_role.reko_role.name
#   policy_arn = data.aws_iam_policy.AmazonDynamoDBFullAccess.arn
# }

resource "aws_iam_role_policy_attachment" "s3_policy" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = data.aws_iam_policy.AmazonS3FullAccess.arn
}

# resource "aws_iam_role_policy_attachment" "reko_policy" {
#   role       = aws_iam_role.reko_role.name
#   policy_arn = data.aws_iam_policy.AmazonRekognitionFullAccess.arn
# }


# resource "aws_iam_role" "photoalbum_group_role" {
#   name = "photoalbum-group-role"

#   assume_role_policy = <<EOF
# {
#   "Version": "2012-10-17",
#   "Statement": [
#     {
#       "Sid": "",
#       "Effect": "Allow",
#       "Principal": {
#         "Federated": "cognito-identity.amazonaws.com"
#       },
#       "Action": "sts:AssumeRoleWithWebIdentity",
#       "Condition": {
#         "StringEquals": {
#           "cognito-identity.amazonaws.com:aud": "${aws_cognito_identity_pool.photoalbum_id_pool.id}"
#         },
#         "ForAnyValue:StringLike": {
#           "cognito-identity.amazonaws.com:amr": "authenticated"
#         }
#       }
#     }
#   ]
# }
# EOF
# }

# //create a role that will be given to the identity pool. This requires a policy 
# resource "aws_iam_role" "photoalbum_cognito_authenticated" {
#   name = "photoalbum_cognito_authenticated"

#   assume_role_policy = <<EOF
# {
#   "Version": "2012-10-17",
#   "Statement": [
#     {
#       "Effect": "Allow",
#       "Principal": {
#         "Federated": "cognito-identity.amazonaws.com"
#       },
#       "Action": "sts:AssumeRoleWithWebIdentity",
#       "Condition": {
#         "StringEquals": {
#           "cognito-identity.amazonaws.com:aud": "${aws_cognito_identity_pool.photoalbum_id_pool.id}"
#         },
#         "ForAnyValue:StringLike": {
#           "cognito-identity.amazonaws.com:amr": "authenticated"
#         }
#       }
#     }
#   ]
# }
# EOF
# }

# resource "aws_iam_role_policy" "cognito_authenticated_policy" {
#   name = "cognito_authenticated_policy"
#   role = aws_iam_role.photoalbum_cognito_authenticated.id

#   policy = <<EOF
# {
#   "Version": "2012-10-17",
#   "Statement": [
#     {
#       "Effect": "Allow",
#       "Action": [
#         "mobileanalytics:PutEvents",
#         "cognito-sync:*",
#         "cognito-identity:*"
#       ],
#       "Resource": [
#         "*"
#       ]
#     },
#     {
#       "Effect": "Allow",
#       "Action": [
#           "s3:*"
#       ],
#       "Resource": [
#           "${aws_s3_bucket.photoalbum-images.arn}/*",
#           "${aws_s3_bucket.photoalbum-images.arn}",
#           "${aws_s3_bucket.photoalbum-thumbs.arn}/*",
#           "${aws_s3_bucket.photoalbum-thumbs.arn}"
#       ]
#   }
#   ]
# }
# EOF
# }

# resource "aws_iam_role_policy_attachment" "dynamodb_RO_policy" {
#   role       = aws_iam_role.photoalbum_cognito_authenticated.name
#   policy_arn = data.aws_iam_policy.AmazonDynamoDBReadOnlyAccess.arn
# }
