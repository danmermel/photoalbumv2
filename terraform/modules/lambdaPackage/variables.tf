variable "filename" {}

variable "runtime" {
  default = "nodejs16.x"
}

variable "timeout" {
  default = 10
}

variable "env_variables" {
  default = {}
}

variable "role" {
}

variable "function_name" {
}

variable "handler" {
}

variable "layers" {
  default = []
}

