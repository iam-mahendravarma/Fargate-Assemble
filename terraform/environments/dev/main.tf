module "vpc" {
  source             = "../../modules/vpc"
  custom_vpc_cidr           = "10.0.0.0/16"
  custom_public_subnets     = ["10.0.1.0/24", "10.0.2.0/24"]
  custom_private_subnets    = ["10.0.101.0/24", "10.0.102.0/24"]
  custom_availability_zones = ["ap-south-1a", "ap-south-1b"]
  fargate-assemble            = "fargate-assemble"
}

module "ec2" {
  source          = "../../modules/ec2"
  ami_id          = "ami-008a9f4478d7401d4"   
  instance_type   = "t3.micro"
  subnet_id       = module.vpc.public_subnet_ids[0]
  vpc_id          = module.vpc.vpc_id
  key_name        = "dev-key"  
  allowed_ssh_cidrs = ["0.0.0.0/0"]
  project         = "fargate-assemble-dev"
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
output "public_ip" {
  value = module.ec2.public_ip
}

