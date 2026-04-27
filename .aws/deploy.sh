#!/usr/bin/env bash
# Usage: bash .aws/deploy.sh [dev|staging|prod]
# Requires: aws CLI, Node.js, npm, jq
set -euo pipefail

PROJECT_NAME="remittances"
ENV="${1:-dev}"
STACK_NAME="${PROJECT_NAME}-${ENV}"
REGION="${AWS_DEFAULT_REGION:-eu-west-1}"
AWS_PROFILE="${AWS_PROFILE:-remittances}"
TEMPLATE_FILE="$(dirname "$0")/cloudformation.yml"
SECRET_ID="${PROJECT_NAME}-${ENV}-front"

echo "▶ [1/5] Fetching env vars from Secrets Manager (${SECRET_ID})..."
# Exportamos directamente al entorno del shell — máxima prioridad en Next.js,
# por encima de .env.local, evitando que valores locales sobreescriban producción.
while IFS= read -r line; do
  export "$line"
done < <(aws secretsmanager get-secret-value \
  --secret-id "$SECRET_ID" \
  --query SecretString \
  --output text \
  --profile "$AWS_PROFILE" \
  --region "$REGION" \
  | jq -r 'to_entries | .[] | "\(.key)=\(.value)"')

echo "▶ [2/5] Building Next.js static export..."
npm run build

echo "▶ [3/5] Deploying CloudFormation stack: ${STACK_NAME}..."
aws cloudformation deploy \
  --template-file "$TEMPLATE_FILE" \
  --stack-name "$STACK_NAME" \
  --parameter-overrides \
    ProjectName="$PROJECT_NAME" \
    Environment="$ENV" \
    DomainName="${DOMAIN_NAME:-}" \
    CertificateArn="${CERTIFICATE_ARN:-}" \
  --no-fail-on-empty-changeset \
  --profile "$AWS_PROFILE" \
  --region "$REGION"

echo "▶ [4/5] Fetching stack outputs..."
BUCKET=$(aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --region "$REGION" \
  --profile "$AWS_PROFILE" \
  --query "Stacks[0].Outputs[?OutputKey=='BucketName'].OutputValue" \
  --output text)

DIST_ID=$(aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --region "$REGION" \
  --profile "$AWS_PROFILE" \
  --query "Stacks[0].Outputs[?OutputKey=='DistributionId'].OutputValue" \
  --output text)

DIST_DOMAIN=$(aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --region "$REGION" \
  --profile "$AWS_PROFILE" \
  --query "Stacks[0].Outputs[?OutputKey=='DistributionDomain'].OutputValue" \
  --output text)

echo "▶ [5/5] Syncing ./out → s3://${BUCKET} and invalidating CloudFront cache..."
aws s3 sync ./out "s3://${BUCKET}" \
  --delete \
  --region "$REGION" \
  --profile "$AWS_PROFILE"

aws cloudfront create-invalidation \
  --distribution-id "$DIST_ID" \
  --paths "/*" \
  --profile "$AWS_PROFILE" \
  --output text

echo ""
echo "✅ Desplegado en: https://${DIST_DOMAIN}"
echo ""
echo "Si es el primer deploy, recuerda:"
echo "  1. Añadir https://${DIST_DOMAIN} en Auth0 → Allowed Callback URLs y Allowed Logout URLs"
echo "  2. Actualizar NEXT_PUBLIC_AUTH0_REDIRECT_URI en el secret '${SECRET_ID}'"
echo "  3. Volver a ejecutar: bash .aws/deploy.sh ${ENV}"
