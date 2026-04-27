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

The app is deployed as a static export to **AWS S3 + CloudFront** behind a custom domain.

- Production URLs: `https://remitagcs.com` and `https://www.remitagcs.com`
- CloudFront default URL: `https://d21ocm4w42wyln.cloudfront.net` (still works, kept for fallback)
- S3 bucket: `remittances-dev-frontend` (private, OAC only)
- Stack name: `remittances-dev` (CloudFormation, eu-west-1)
- DNS hosted zone: Route53 (`remitagcs.com`), with the apex registered at GoDaddy pointing its NS records to Route53
- SSL certificate: ACM in **us-east-1** (mandatory for CloudFront), validated via Route53 DNS, auto-renewing

### Deploy to AWS

Requires AWS CLI configured with the `remittances` profile:

```bash
aws configure --profile remittances
```

Then, with the custom domain:

```bash
DOMAIN_NAME=remitagcs.com \
CERTIFICATE_ARN=<arn from ACM, see below> \
bash .aws/deploy.sh dev
```

Without the custom domain (useful for fresh environments before DNS/ACM is set up):

```bash
bash .aws/deploy.sh dev
```

When `DOMAIN_NAME` and `CERTIFICATE_ARN` are unset, CloudFront falls back to its default `*.cloudfront.net` URL with the AWS-provided certificate.

The script does the following in order:
1. Fetches env vars from AWS Secrets Manager (`remittances-dev-front`)
2. Runs `npm run build` — generates `./out/`
3. Deploys/updates the CloudFormation stack (S3 + CloudFront, with custom domain if provided)
4. Syncs `./out/` to S3 with `--delete` (removes old files)
5. Invalidates the CloudFront cache (`/*`)

### Where to find the deploy values

- **`DOMAIN_NAME`** — the apex domain (`remitagcs.com`). Check it in AWS Console → **Route 53** → **Hosted zones**.
- **`CERTIFICATE_ARN`** — AWS Console → switch region to **N. Virginia (us-east-1)** → **Certificate Manager** → click on the certificate for `remitagcs.com` → copy the ARN at the top of the detail panel (format: `arn:aws:acm:us-east-1:<account-id>:certificate/<uuid>`). Status must be **Issued**.

> ⚠️ The certificate **must** live in `us-east-1`, even though the rest of the stack is in `eu-west-1`. CloudFront only accepts ACM certificates from N. Virginia. If you don't see your CloudFront distribution in the dropdown when creating an ACM certificate, you're in the wrong region.

### AWS infrastructure

Defined in [.aws/cloudformation.yml](.aws/cloudformation.yml):

- **S3** — private bucket, public access fully blocked, AES256 encryption, versioning enabled. Only CloudFront can read via OAC (sigv4).
- **CloudFront** — HTTPS only, HTTP redirects to HTTPS, http2+3, PriceClass_100 (US + Europe). Security headers on all responses (HSTS 2y, X-Frame-Options DENY, X-Content-Type-Options, Referrer-Policy). Separate cache policies: `/_next/static/*` cached aggressively (content-hashed assets), everything else no-cache (HTML propagates immediately on deploy).
- **Custom domain** — when `DomainName` + `CertificateArn` are provided, CloudFront adds them as `Aliases` and uses the ACM cert with `sni-only` and TLS 1.2+. When omitted, falls back to the default cloudfront.net certificate. Controlled by the `HasCustomDomain` CloudFormation condition.
- **SPA routing** — CloudFront 403/404 → `/index.html` with 200.

DNS and SSL live outside the stack (Route53 hosted zone + ACM certificate are managed manually) — they're long-lived resources with their own lifecycle, and CloudFormation stack deletes don't clobber them.

### IAM permissions

The `remittances-deploy` IAM user has a Customer Managed Policy (`remittances-deploy`) scoped exclusively to:
- `cloudformation:*` on `stack/remittances-*` stacks
- `s3:*` on `remittances-*` buckets
- `cloudfront:*` on distributions tagged `Project: remittances` (plus a few unconditional permissions for OAC / response-headers policies, since those resources don't support tags)
- `secretsmanager:GetSecretValue` on `remittances-*` secrets (eu-west-1)

It has zero access to any other project or AWS service.

The Route53 and ACM resources are **not** managed by this IAM user — they're long-lived and were created once via the AWS dashboard with a more privileged user. The deploy user doesn't need (and shouldn't have) permissions to mutate DNS or certificates on every deploy.

### First-time setup (after a fresh AWS account or new environment)

1. **IAM** — Create the IAM user `remittances-deploy` with the `remittances-deploy` Customer Managed Policy. Generate access keys and run `aws configure --profile remittances`.
2. **Secrets Manager** — Create the secret with all `NEXT_PUBLIC_*` values:
   ```bash
   aws secretsmanager create-secret \
     --name "remittances-dev-front" \
     --secret-string '{"NEXT_PUBLIC_API_URL":"...","NEXT_PUBLIC_AUTH0_DOMAIN":"...","NEXT_PUBLIC_AUTH0_CLIENT_ID":"...","NEXT_PUBLIC_AUTH0_AUDIENCE":"...","NEXT_PUBLIC_AUTH0_REDIRECT_URI":"...","NEXT_PUBLIC_DEPOSIT_AMOUNT_ENABLED":"false","NEXT_PUBLIC_DESIGN_MODE":"false"}' \
     --profile remittances --region eu-west-1
   ```
3. **First deploy without domain** — `bash .aws/deploy.sh dev`. Creates the stack and prints the CloudFront URL.
4. **Auth0 setup with CloudFront URL** — add the CloudFront URL to Auth0 (Allowed Callback URLs, Logout URLs, Web Origins). Update `NEXT_PUBLIC_AUTH0_REDIRECT_URI` in the secret. Redeploy.
5. **(Optional) Custom domain** — when you have a domain ready:
   - Register it (any registrar) and create a Route53 hosted zone for it. If registered elsewhere, update the registrar's nameservers to the 4 from Route53.
   - Request an ACM certificate in **us-east-1** for both apex and `www`, validate via Route53.
   - Re-run the deploy with `DOMAIN_NAME=<domain> CERTIFICATE_ARN=<arn>` set.
   - In Route53, create A-ALIAS records (apex and `www`) pointing to the CloudFront distribution.
   - Update Auth0 with the new domain URLs and update `NEXT_PUBLIC_AUTH0_REDIRECT_URI` in the secret.
   - Redeploy.

### CI/CD (not active yet)

A GitHub Actions workflow is available at [.github/workflows/deploy.yml](.github/workflows/deploy.yml). It uses OIDC federation (no stored AWS keys) and triggers manually from the GitHub Actions UI. To activate it, create the OIDC Identity Provider and IAM role in AWS as documented in the workflow file.
