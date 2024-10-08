terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.16"
    }
  }

  required_version = ">= 1.2.0"
}

provider "aws" {
  region  = "us-east-1"
  profile = "personal"
}

resource "aws_s3_bucket" "bucket-pokedex" {
  bucket = "pokedex.cafesao.net"
}

resource "aws_s3_bucket_public_access_block" "bucket-pokedex-public-access-block" {
  bucket = aws_s3_bucket.bucket-pokedex.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_website_configuration" "bucket-pokedex-website" {
  bucket = aws_s3_bucket.bucket-pokedex.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "error.html"
  }
}

resource "aws_s3_bucket_ownership_controls" "bucket-pokedex-ownership-controls" {
  bucket = aws_s3_bucket.bucket-pokedex.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_acl" "bucket-pokedex-acl" {
  bucket = aws_s3_bucket.bucket-pokedex.id

  acl = "public-read"
  depends_on = [
    aws_s3_bucket_ownership_controls.bucket-pokedex-ownership-controls,
    aws_s3_bucket_public_access_block.bucket-pokedex-public-access-block
  ]
}


resource "aws_s3_bucket_policy" "bucket-pokedex-policy" {
  bucket = aws_s3_bucket.bucket-pokedex.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource = [
          aws_s3_bucket.bucket-pokedex.arn,
          "${aws_s3_bucket.bucket-pokedex.arn}/*",
        ]
      },
    ]
  })

  depends_on = [
    aws_s3_bucket_public_access_block.bucket-pokedex-public-access-block
  ]
}

module "template_files" {
  source = "hashicorp/dir/template"

  base_dir = "${path.module}/../dist"

}
resource "aws_s3_object" "bucket-pokedex-object" {
  bucket = aws_s3_bucket.bucket-pokedex.bucket
  for_each = module.template_files.files
  key          = each.key
  content_type = each.value.content_type

  # The template_files module guarantees that only one of these two attributes
  # will be set for each file, depending on whether it is an in-memory template
  # rendering result or a static file on disk.
  source  = each.value.source_path
  content = each.value.content

  # Unless the bucket has encryption enabled, the ETag of each object is an
  # MD5 hash of that object.
  etag = each.value.digests.md5
}

resource "aws_route53_zone" "cafesao-zone" {
  name = "cafesao.net"
}

resource "aws_route53_record" "pokedex-record" {
  zone_id = aws_route53_zone.cafesao-zone.zone_id
  name = "pokedex.cafesao.net"
  type = "A"
  alias {
    name = aws_s3_bucket_website_configuration.bucket-pokedex-website.website_domain
    zone_id = aws_s3_bucket.bucket-pokedex.hosted_zone_id
    evaluate_target_health = false
  }
  depends_on = [ aws_s3_bucket_website_configuration.bucket-pokedex-website ]
}