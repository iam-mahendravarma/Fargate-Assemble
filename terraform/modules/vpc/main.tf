resource "aws_vpc" "main" {
  cidr_block           = var.custom_vpc_cidr
  enable_dns_hostnames = true
  tags = {
    Name = "${var.fargate-assemble}-vpc"
    Environment = "dev"
  }
}

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main.id
  tags = {
    Name = "${var.fargate-assemble}-igw"
  }
}

resource "aws_subnet" "public" {
  count             = length(var.custom_public_subnets)
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.custom_public_subnets[count.index]
  availability_zone = var.custom_availability_zones[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.fargate-assemble}-public-${count.index + 1}"
  }
}

resource "aws_subnet" "private" {
  count             = length(var.custom_private_subnets)
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.custom_private_subnets[count.index]
  availability_zone = var.custom_availability_zones[count.index]

  tags = {
    Name = "${var.fargate-assemble}-private-${count.index + 1}"
  }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  tags = {
    Name = "${var.fargate-assemble}-public-rt"
  }
}

resource "aws_route" "default_public" {
  route_table_id         = aws_route_table.public.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.igw.id
}

resource "aws_route_table_association" "public" {
  count          = length(aws_subnet.public)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}
