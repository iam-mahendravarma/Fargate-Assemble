variable "project" {
  description = "fargate-assemble"
  type        = string
}

variable "ami_id" {
  description = "ami-008a9f4478d7401d4"
  type        = string
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.micro"
}

variable "subnet_id" {
  description = "Subnet ID"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "key_name" {
  description = "EC2 key pair name"
  type        = string
}

variable "allowed_ssh_cidrs" {
  description = "List of CIDRs allowed to SSH"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}
