variable "bucket_prefix" {
  type    = string
  default = "photoalbumv2"
}

variable "API_KEY" {
  description = "the apikey from the user"
  type        = string
  sensitive   = true
}

variable "node_version" {
  type = string
  default = "nodejs22.x"
}