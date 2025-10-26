# Incident-Runbook

**Ziel:** Störungen schnell erkennen, Wirkung begrenzen, Ursache beheben, Lehren ziehen.

## 0) Signale & Start
- **Alarme**: Slack `#alerts` (Sentry Error-Rate >5%/5min, p95 >1000ms/5min, Release-Regression >10/10min)
- **Synthetic Health**: GitHub Action „Synthetic Health" (5-Min-Takt)

## 1) Erkennen (Detection)
1. Slack-Alert → Link zu Sentry-Issue öffnen
2. Notiere:
   - `release` (Commit-SHA)
   - `request_id` (Tag in Sentry) für Log-Korrelation

## 2) Triage (≤ 15 Minuten)
1. **Scope** in Sentry prüfen:
   - Top-Events, betroffene Routen/Tenants/Browserversionen
   - Traces/Spans (Performance) – Engpass lokalisieren
2. **Korrelation**:
   - `request_id` in Logs/Monitoring (falls vorhanden) querprüfen
3. **Regression?**
   - Betrifft es das jüngste Release? Falls ja → *Regression* labeln

## 3) Mitigation
- **Schnellbremse**:
  - Feature-Flag schließen (falls verfügbar)
  - Sampling zur Analyse auf Preview erhöhen (`SENTRY_TRACES_SAMPLE_RATE`)
- **Rollback**:
  - Vercel → letztes grünes Deployment aktivieren
  - Produktionslage prüfen (Error-Rate/Health)

## 4) Behebung (Fix)
- Hotfix-PR (klein, isoliert)
- PR-Checks (CI, E2E, Size, CodeQL) müssen grün sein
- Nach Deploy: KPIs 10–30 Min beobachten

## 5) Kommunikation
- Interner Status in `#ops` updaten (Start/Status/Ende)
- Optional: Status-Page (falls vorhanden)

## 6) Review (Postmortem, ≤ 48h)
- **Root Cause**: Mensch/Prozess/System?
- **Was hat gewirkt / gefehlt?** (Detektion, Gates, Tests)
- **Maßnahmen** (Guardrails):
  - Test/Lint/Bundle-Budget/Filter ergänzen
  - Runbook anpassen

## Anhänge
- **Health-Check**: `curl -sI https://<prod>/api/health`
- **Request-ID**: `curl -sI https://<prod>/ | grep -i x-request-id`
- **Sentry Live-Probe**: `/sentry-test` (nur mit Flag `NEXT_PUBLIC_ENABLE_SENTRY_TEST=on`)
