# Remita — Digital Money Transfer Platform

A modern frontend for cross-border money transfers built with Next.js 16, TypeScript, and Tailwind CSS.

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack, static export)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Components**: shadcn/ui
- **State / Data**: TanStack React Query
- **Authentication**: Auth0 (client-side)
- **Infra**: AWS S3 + CloudFront

## Local development

```bash
cp .env.example .env.local   # fill in your values
npm install
npm run dev                  # http://localhost:3002
```

## Environment variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Debita backend API base URL |
| `NEXT_PUBLIC_AUTH0_DOMAIN` | Auth0 tenant domain |
| `NEXT_PUBLIC_AUTH0_CLIENT_ID` | Auth0 SPA client ID |
| `NEXT_PUBLIC_AUTH0_AUDIENCE` | Auth0 API audience |
| `NEXT_PUBLIC_AUTH0_REDIRECT_URI` | OAuth callback URL (must match Auth0 config) |
| `NEXT_PUBLIC_DEPOSIT_AMOUNT_ENABLED` | Feature flag — amount input on deposit step |
| `NEXT_PUBLIC_DESIGN_MODE` | Mock data mode, no API calls |

Production values are stored in **AWS Secrets Manager** under `remittances-dev-front` (eu-west-1). The deploy script fetches them automatically before building.

## Deployment

The app is deployed as a static export to **AWS S3 + CloudFront**.

- S3 bucket: `remittances-dev-frontend` (private, OAC only)
- CloudFront: `https://d21ocm4w42wyln.cloudfront.net`
- Stack name: `remittances-dev` (CloudFormation, eu-west-1)

### Deploy to AWS

Requires AWS CLI configured with the `remittances` profile:

```bash
aws configure --profile remittances
```

Then:

```bash
bash .aws/deploy.sh        # deploy to dev (default)
bash .aws/deploy.sh dev    # same
```

The script does the following in order:
1. Fetches env vars from AWS Secrets Manager (`remittances-dev-front`)
2. Runs `npm run build` — generates `./out/`
3. Deploys/updates the CloudFormation stack (S3 + CloudFront)
4. Syncs `./out/` to S3 with `--delete` (removes old files)
5. Invalidates the CloudFront cache (`/*`)

### AWS infrastructure

Defined in [.aws/cloudformation.yml](.aws/cloudformation.yml):

- **S3** — private bucket, public access fully blocked, AES256 encryption, versioning enabled. Only CloudFront can read via OAC (sigv4).
- **CloudFront** — HTTPS only, HTTP redirects to HTTPS, http2+3, PriceClass_100 (US + Europe). Security headers on all responses (HSTS 2y, X-Frame-Options DENY, X-Content-Type-Options, Referrer-Policy). Separate cache policies: `/_next/static/*` cached aggressively (content-hashed assets), everything else no-cache (HTML propagates immediately on deploy).
- **SPA routing** — CloudFront 403/404 → `/index.html` with 200.

### IAM permissions

The `remittances-deploy` IAM user (AWS account 478135004814) has a Customer Managed Policy (`remittances-deploy`) scoped exclusively to:
- `cloudformation:*` on `stack/remittances-*` stacks
- `s3:*` on `remittances-*` buckets
- `cloudfront:*` on distributions tagged `Project: remittances`
- `secretsmanager:GetSecretValue` on `remittances-*` secrets (eu-west-1)

It has zero access to any other project or AWS service.

### First-time setup (after a fresh AWS account or new environment)

1. Create the IAM user `remittances-deploy` with the `remittances-deploy` Customer Managed Policy
2. Create access keys and run `aws configure --profile remittances`
3. Create the Secrets Manager secret:
   ```bash
   aws secretsmanager create-secret \
     --name "remittances-dev-front" \
     --secret-string '{"NEXT_PUBLIC_AUTH0_CLIENT_ID":"...","NEXT_PUBLIC_AUTH0_REDIRECT_URI":"..."}' \
     --profile remittances --region eu-west-1
   ```
4. Run `bash .aws/deploy.sh dev` — first deploy creates the stack and prints the CloudFront URL
5. Add the CloudFront URL to Auth0 (Allowed Callback URLs, Logout URLs, Web Origins)
6. Update `NEXT_PUBLIC_AUTH0_REDIRECT_URI` in the secret and redeploy

### CI/CD (not active yet)

A GitHub Actions workflow is available at [.github/workflows/deploy.yml](.github/workflows/deploy.yml). It uses OIDC federation (no stored AWS keys) and triggers manually from the GitHub Actions UI. To activate it, create the OIDC Identity Provider and IAM role in AWS as documented in the workflow file.
