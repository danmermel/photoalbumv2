# resource "aws_cognito_user_pool" "photoalbum_cognito_pool" {
#   name   = "photoalbum_cognito_pool"
#   username_attributes = [ "email" ]
#   password_policy  { 
#     minimum_length                   = 8
#     require_lowercase                = true
#     require_numbers                  = true
#     require_uppercase                = true
#     temporary_password_validity_days = 7
#     require_symbols                  = false
#   }
#   admin_create_user_config  {
#     allow_admin_create_user_only = true
#   }
 
# }

# output "cognitoUserPool"  {
#   value = aws_cognito_user_pool.photoalbum_cognito_pool.id
# }

# resource "aws_cognito_user_group" "allusers" {
#   name         = "allusers"
#   user_pool_id = aws_cognito_user_pool.photoalbum_cognito_pool.id
#   description  = "Managed by Terraform"
#   role_arn     = aws_iam_role.photoalbum_group_role.arn
# }

# resource "aws_cognito_user_pool_client" "app-photoalbum" {
#   name = "app-photoalbum"
#   user_pool_id = aws_cognito_user_pool.photoalbum_cognito_pool.id
#   callback_urls = terraform.workspace == "stage" ? [ "https://mermelstein.co.uk"] : ["http://localhost:8001"]
#   logout_urls = terraform.workspace == "stage" ? [ "https://mermelstein.co.uk"] : ["http://localhost:8001"]
#   allowed_oauth_flows = [ "implicit" ]
#   allowed_oauth_scopes = [ "email","openid" ]
#   allowed_oauth_flows_user_pool_client = true
#   supported_identity_providers = [ "COGNITO" ]

# }

# output "cognitoAppId"  {
#   value = aws_cognito_user_pool_client.app-photoalbum.id
# }

# output "cognitoCallbackUrls" {
#   value = aws_cognito_user_pool_client.app-photoalbum.callback_urls
# }

# output "cognitoLogoutUrls" {
#   value = aws_cognito_user_pool_client.app-photoalbum.logout_urls
# }

# resource "aws_cognito_user_pool_domain" "photoalbum-domain" {
#   domain       = "photoalbum"
#   user_pool_id = aws_cognito_user_pool.photoalbum_cognito_pool.id
# }

# output "cognitoAppDomain"  {
#   value = aws_cognito_user_pool_domain.photoalbum-domain.domain
# }

# //Create a federated identity pool
# resource "aws_cognito_identity_pool" "photoalbum_id_pool" {
#   identity_pool_name               = "photoalbum_pool"
#   allow_unauthenticated_identities = false

#   cognito_identity_providers {
#   client_id               = aws_cognito_user_pool_client.app-photoalbum.id
#   provider_name           = "cognito-idp.${data.aws_region.current.name}.amazonaws.com/${aws_cognito_user_pool.photoalbum_cognito_pool.id}"
#   server_side_token_check = false
#   }
# }

# output "cognitoIdentityPool"  {
#   value = aws_cognito_identity_pool.photoalbum_id_pool.id
# }

# //attach the role to the identity pool
# resource "aws_cognito_identity_pool_roles_attachment" "photoalbum_id_pool_role_attachment" {
#   identity_pool_id = aws_cognito_identity_pool.photoalbum_id_pool.id

#   roles = {
#     "authenticated" = aws_iam_role.photoalbum_cognito_authenticated.arn
#   }
# }