This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Observability & Monitoring

This project uses Sentry for error tracking and synthetic health checks via GitHub Actions.

### Required Environment Variables

Before deploying, configure these secrets:

#### Vercel Environment Variables
1. **Build-time** (needed for source map upload):
   - `SENTRY_AUTH_TOKEN` - Sentry API authentication token
   - `SENTRY_ORG` - Your Sentry organization slug
   - `SENTRY_PROJECT` - Your Sentry project slug

2. **Runtime** (needed for error reporting):
   - `SENTRY_DSN` - Sentry Data Source Name for server-side
   - `NEXT_PUBLIC_SENTRY_DSN` - Sentry DSN for client-side (public)

#### GitHub Repository Secrets
1. `HEALTHCHECK_URL` - Your production app URL (e.g., `https://your-app.vercel.app/api/health`)
2. `SLACK_WEBHOOK_URL` - Slack webhook for health check alerts

### Setup Steps

1. **Create Sentry Project**:
   - Go to [sentry.io](https://sentry.io) and create a new Next.js project
   - Copy the DSN from Settings → Client Keys
   - Generate an auth token from Settings → Account → API → Auth Tokens

2. **Set Vercel Environment Variables**:
   ```bash
   vercel env add SENTRY_AUTH_TOKEN
   vercel env add SENTRY_ORG
   vercel env add SENTRY_PROJECT
   vercel env add SENTRY_DSN
   vercel env add NEXT_PUBLIC_SENTRY_DSN
   ```

3. **Set GitHub Secrets**:
   - Go to repository Settings → Secrets and variables → Actions
   - Add `HEALTHCHECK_URL` and `SLACK_WEBHOOK_URL`

4. **Create Slack Webhook**:
   - Go to your Slack workspace → Apps → Incoming Webhooks
   - Create new webhook and copy the URL

### Testing

The project will build successfully without secrets (with warnings). Set real values before deploying to production.

## Sentry Alert Rules (Post-Deployment)

After deploying with secrets, configure these alert rules in Sentry UI for actionable notifications:

### 1. Error Rate Alert
- **Condition:** Error rate > 5% in 5 minutes
- **Channel:** Slack #alerts
- **Purpose:** Detect sudden spikes in errors

### 2. Performance Degradation
- **Condition:** p95 Transaction Duration > 1000ms for 5 minutes
- **Channel:** Slack #alerts
- **Purpose:** Catch performance regressions

### 3. Release Regression
- **Condition:** New release has > 10 errors in first 10 minutes
- **Channel:** Slack #alerts
- **Purpose:** Fast rollback on bad deployments

**Setup Location:** Sentry → Settings → Alerts → Create Alert Rule

Document the exact thresholds in this README after configuring them.
