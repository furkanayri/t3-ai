#!/bin/sh
set -eu

REGION="${AWS_DEFAULT_REGION:-eu-west-1}"
DLQ_NAME="${SQS_DLQ_NAME:-VideoJobQueueLocalDLQ}"
QUEUE_NAME="${SQS_QUEUE_NAME:-VideoJobQueueLocal}"

awslocal sqs create-queue --region "$REGION" --queue-name "$DLQ_NAME" >/dev/null
DLQ_URL="$(awslocal sqs get-queue-url --region "$REGION" --queue-name "$DLQ_NAME" --query QueueUrl --output text)"
DLQ_ARN="$(awslocal sqs get-queue-attributes --region "$REGION" --queue-url "$DLQ_URL" --attribute-names QueueArn --query 'Attributes.QueueArn' --output text)"

awslocal sqs create-queue \
  --region "$REGION" \
  --queue-name "$QUEUE_NAME" \
  --attributes "{\"VisibilityTimeout\":\"900\",\"ReceiveMessageWaitTimeSeconds\":\"20\",\"RedrivePolicy\":\"{\\\"deadLetterTargetArn\\\":\\\"${DLQ_ARN}\\\",\\\"maxReceiveCount\\\":\\\"3\\\"}\"}" \
  >/dev/null

echo "Local SQS queues are ready: ${QUEUE_NAME}, ${DLQ_NAME}"

COMPARISON_QUEUE_NAME="${COMPARISON_SQS_QUEUE_NAME:-VideoComparisonQueueLocal}"
COMPARISON_DLQ_NAME="${COMPARISON_SQS_DLQ_NAME:-VideoComparisonQueueLocalDLQ}"
awslocal sqs create-queue --region "$REGION" --queue-name "$COMPARISON_DLQ_NAME" >/dev/null
COMPARISON_DLQ_URL="$(awslocal sqs get-queue-url --region "$REGION" --queue-name "$COMPARISON_DLQ_NAME" --query QueueUrl --output text)"
COMPARISON_DLQ_ARN="$(awslocal sqs get-queue-attributes --region "$REGION" --queue-url "$COMPARISON_DLQ_URL" --attribute-names QueueArn --query 'Attributes.QueueArn' --output text)"
awslocal sqs create-queue \
  --region "$REGION" \
  --queue-name "$COMPARISON_QUEUE_NAME" \
  --attributes "{\"VisibilityTimeout\":\"900\",\"ReceiveMessageWaitTimeSeconds\":\"20\",\"RedrivePolicy\":\"{\\\"deadLetterTargetArn\\\":\\\"${COMPARISON_DLQ_ARN}\\\",\\\"maxReceiveCount\\\":\\\"3\\\"}\"}" \
  >/dev/null

echo "Comparison SQS queues are ready: ${COMPARISON_QUEUE_NAME}, ${COMPARISON_DLQ_NAME}"
