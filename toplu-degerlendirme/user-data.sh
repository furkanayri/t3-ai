#!/bin/bash
# Legacy EC2 bootstrap template. Supply secrets through instance metadata or a
# secret manager; never embed credentials in this file.
set -e

: "${AWS_DEFAULT_REGION:?AWS_DEFAULT_REGION is required}"
: "${AWS_ACCOUNT_ID:?AWS_ACCOUNT_ID is required}"
: "${MONGO_URI:?MONGO_URI is required}"
: "${SQS_URL:?SQS_URL is required}"
: "${R2_BUCKET_URL:?R2_BUCKET_URL is required}"

systemctl start docker
systemctl enable docker

aws ecr get-login-password --region "$AWS_DEFAULT_REGION" | \
  docker login --username AWS --password-stdin \
  "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com"

docker run -d \
  --name video-worker \
  --restart always \
  --gpus all \
  -e MONGO_URI="$MONGO_URI" \
  -e SQS_URL="$SQS_URL" \
  -e AWS_REGION="$AWS_DEFAULT_REGION" \
  -e R2_BUCKET_URL="$R2_BUCKET_URL" \
  "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com/video-worker-repo:latest"
