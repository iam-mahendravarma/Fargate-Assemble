resource "aws_ecr_repository" "this" {
  name = "${var.fargate-assemble-ecr}"
  image_scanning_configuration {
    scan_on_push = true
  }
  tags = {
    Name = "${var.fargate-assemble-ecr}"
  }
}
