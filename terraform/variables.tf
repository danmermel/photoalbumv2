variable "bucket_prefix" {
  type    = string
  default = "photoalbumv2"
}

variable "API_KEY" {
  description = "the apikey from the user"
  type        = string
  sensitive   = true
}