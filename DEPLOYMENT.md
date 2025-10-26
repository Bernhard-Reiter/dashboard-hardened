# DEPLOYMENT-Checkliste

## 1) Voraussetzungen
- ✅ Secrets in **Vercel** (Prod/Preview):
  - SENTRY_DSN, NEXT_PUBLIC_SENTRY_DSN
  - SENTRY_AUTH_TOKEN, SENTRY_ORG, SENTRY_PROJECT
  - optional: SENTRY_TRACES_SAMPLE_RATE (Prod 0.1, Preview/Dev 1.0)
- ✅ Secrets in **GitHub**:
  - HEALTHCHECK_URL, SLACK_WEBHOOK_URL
- ✅ Sentry Org Settings:
  - EU-Region, IP Address Collection = off, Data Scrubbing aktiv

## 2) Vor Merge/Release
- PR-Checks grün: CI, E2E (gegen Preview), Size-Limit, CodeQL, OSV
- Health-Endpoint liefert 200 + `cache-control: no-store`

## 3) Release
- Merge nach `main` → Vercel Production Deploy (auto)
- Nach Livegang:
  - Sentry: Error-Rate <5%, p95 <1000ms (5–15 Min beobachten)
  - Synthetic Health: grün

## 4) Rollback (wenn nötig)
- Vercel Dashboard → letztes grünes Deployment aktivieren
- Slack Update posten, Incident-Runbook → Triage/Hotfix

## 5) Nachbereitung
- Alerts final justieren (Fehlalarme reduzieren)
- Token-Rotation planen (SENTRY_AUTH_TOKEN, quartalsweise)
- Dokumentation aktuell halten (Incident-Report/Changelog)
