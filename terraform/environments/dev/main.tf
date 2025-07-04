module "vpc" {
  source             = "../../modules/vpc"
  custom_vpc_cidr           = "10.0.0.0/16"
  custom_public_subnets     = ["10.0.1.0/24", "10.0.2.0/24"]
  custom_private_subnets    = ["10.0.101.0/24", "10.0.102.0/24"]
  custom_availability_zones = ["ap-south-1a", "ap-south-1b"]
  fargate-assemble            = "fargate-assemble"
}

module "ecr" {
  source                  = "../../modules/ecr"
  fargate-assemble-ecr    = "fargate-assemble-ecr"
}

output "ecr_repository_url" {
  value = module.ecr.repository_url
}
output "vpc_id" {
  value = module.vpc.vpc_id
}

