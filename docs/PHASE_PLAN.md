# RiskGuard Investigator — Phase Plan
**Branch:** `feat/investigator-platform`
**Audited:** 2026-10-19

> Gate-0 artefact. Tick off completed items at the start of each phase.

---

## 1. CURRENT-STATE MAP (verified by reading every file)

### Repository root
```
RiskGuard/
├── package.json          root npm scripts: dev, dev:all, dev:ml, build
├── frontend/             Next.js 16.4.0 app
└── ml-service/           FastAPI scoring service
```

### frontend/ — verified
| Item | Detail |
|------|--------|
| Framework | Next.js 16.4.0 (Turbopack) |
| React | 19.3.0 |
| Styling | Tailwind 3.4.19, CSS vars in `globals.css`, `tailwind.config.ts` extends `cyber.*`, `risk.*` |
| Pages | **Single route `/`** — 346-line monolith with 4 client-side tabs |
| Router | App Router only (no `pages/`) |
| Components | 11 files: Navbar, ThreatTicker, StatsCards, TransactionTable, InlineInspector, TransactionModal, RiskSimulator, ModelAnalytics, ShapWaterfallChart, GeoThreatMap, ArchitectureDiagram |
| Data | `mockData.ts` (6 static seed txns, mock metrics, PR-curve, confusion matrix, SHAP global) |
| Scoring | `scoringEngine.ts` — client-side rule engine (NOT the XGBoost model) |
| API client | `api.ts` — calls `localhost:8000` directly from browser; silent fallback to rule engine; dead `:5000` override reference |
| Sound | `soundFx.ts` — always-on, has `any` type error |
| Tests | **None** |
| ESLint | 5 errors, 57 warnings |
| Build | ✅ Passes |

### ml-service/ — verified
| Item | Detail |
|------|--------|
| Endpoints | `GET /health`, `GET /v1/model/metrics`, `POST /v1/risk/evaluate` |
| Auth | **None** — `allow_origins=["*"]`, no token |
| DB | **None** — stateless |
| Tests | ✅ 6/6 pass |
| **P1 PROBLEM** | precision=1.0, FPR=0.0, ROC-AUC=0.9999, otpChallengeCount=0 — near-perfect separability / label-leaky data |
| Latency | ~23 ms P50 (well under 40 ms) |

---

## 2. KNOWN PROBLEMS (must fix, not hide)

| # | Problem | Fix in Phase |
|---|---------|--------------|
| P1 | ML metrics not credible (precision 1.0, FPR 0.0, ROC-AUC 0.9999, OTP=0) | 4 |
| P2 | CORS `allow_origins=["*"]`, no auth on ML service | 3 |
| P3 | Browser calls ML service directly (no proxy) | 3 |
| P4 | Silent fallback to rule engine gives fake scores when ML is down | 3 |
| P5 | Dead `:5000` Express gateway reference | 3 |
| P6 | No auth / sessions / RBAC / protected routes | 3 |
| P7 | No database — nothing persists | 2 |
| P8 | mockData / scoringEngine use plausible Indian names and real email domains | 1 |
| P9 | `soundFx.ts` `any` type ESLint error | 1 |
| P10 | No `.gitignore` at repo root for venv/node_modules | 1 |
| P11 | No SECRET_KEY / env var management | 2 |
| P12 | No demo banner ("DEMO — SYNTHETIC DATA ONLY") | 1 |

---

## 3. NEXT.JS 16 BREAKING CHANGES (read from `node_modules/next/dist/docs/`)

| Feature | Old | New in 16.4 |
|---------|-----|-------------|
| Route guards file | `middleware.js` | **`proxy.js`** (middleware deprecated) |
| Export name | `export default function middleware` | **`export function proxy`** |
| Cookies | synchronous in some contexts | **`await cookies()`** everywhere |
| Server Actions | `useFormState` | **`useActionState`** (React 19) |

**Critical for Phase 3:** Route protection must use `src/proxy.ts` with `export function proxy`. Writing `middleware.ts` will be silently ignored in Next.js 16.

---

## 4. FILE-LEVEL CHANGE PLAN BY PHASE

### PHASE 1 — Dark UI shell, navigation, pages (mock data, no auth)

**New frontend files:**
```
src/app/login/page.tsx              — static shell (no real auth yet)
src/app/dashboard/page.tsx          — monitor tab content moved here
src/app/transactions/page.tsx       — placeholder
src/app/transactions/[id]/page.tsx  — placeholder
src/app/cases/page.tsx              — placeholder
src/app/cases/[id]/page.tsx         — placeholder
src/app/reports/page.tsx            — placeholder
src/app/audit/page.tsx              — placeholder (Admin/Supervisor)
src/app/models/page.tsx             — ModelAnalytics moved here
src/app/simulator/page.tsx          — RiskSimulator moved here
src/app/settings/page.tsx           — placeholder
src/app/not-found.tsx               — 404 boundary
src/app/error.tsx                   — error boundary
src/app/loading.tsx                 — global skeleton

src/components/layout/AppShell.tsx  — sidebar + topbar wrapper
src/components/layout/Sidebar.tsx   — nav links with role placeholders
src/components/layout/TopBar.tsx    — officer name, search, demo banner
src/components/layout/DemoBanner.tsx — persistent "DEMO — SYNTHETIC DATA" strip
src/components/ui/RiskBadge.tsx     — LOW/MEDIUM/HIGH/CRITICAL badge
src/components/ui/LoadingSkeleton.tsx

src/lib/apiClient.ts                — typed fetch wrapper (mock data for now)
vitest.config.ts
src/test/                           — component tests
```

**Modified:**
```
src/app/globals.css       — CSS variable tokens (sidebar, status colours, 8px grid)
src/app/layout.tsx        — wrap with AppShell, add DemoBanner
tailwind.config.ts        — add sidebar, status, CRITICAL band tokens
src/app/page.tsx          — redirect → /dashboard
src/lib/soundFx.ts        — fix `any` type error; default sound to OFF (localStorage flag)
src/lib/mockData.ts       — email domains → example.org, obviously-fake names
src/lib/scoringEngine.ts  — same email/name cleanup
package.json              — add vitest, @testing-library/react
```

**Root:**
```
.gitignore                — add venv/, node_modules/, .env, *.pyc, .next/
```

---

### PHASE 2 — Backend foundation + real persistence

**New: `backend/` directory**
```
backend/
  app/
    api/v1/auth.py, transactions.py, cases.py, reports.py, audit.py, models.py, admin/users.py
    core/config.py (pydantic-settings), security.py, logging.py, deps.py
    models/user.py, session.py, transaction.py, risk_assessment.py, case.py,
            case_note.py, case_event.py, audit_log.py, report.py
    schemas/          — pydantic v2 I/O schemas
    services/scoring.py, seed.py
    repositories/     — DB query layer
  alembic/            — migrations
  tests/
  main.py
  requirements.txt
  .env.example

scripts/seed_demo.py    — idempotent: ~5000 synthetic txns, 4 officers, 12 cases
scripts/create_officer.py
docker-compose.yml
Makefile                — make dev, make test, make seed
```

**Modified:**
```
frontend/next.config.ts  — rewrites: /api/* → http://localhost:9000/api/*
frontend/src/lib/apiClient.ts — update to /api/v1/* (same-origin, no absolute URL)
```

---

### PHASE 3 — Auth, RBAC, sessions, route protection

**New:**
```
frontend/src/proxy.ts           — route guard (Next.js 16 proxy.ts, NOT middleware.ts)
frontend/src/app/login/         — real Server Action login (useActionState + await cookies())
frontend/src/app/login/actions.ts
frontend/src/components/SessionExpiryModal.tsx
backend/app/core/rbac.py        — require_role(), require_permission() deps
backend/tests/test_auth.py      — route×role matrix, lockout, CSRF, no-signup
```

**Modified:**
```
backend/app/core/config.py  — SECRET_KEY required, fail startup if missing/default in non-dev
backend/app/main.py         — security headers, CORS tightened to backend origin only
ml-service/src/main.py      — add X-Internal-Token header check, tighten CORS
frontend/src/lib/apiClient.ts — CSRF double-submit token on mutations
frontend/src/lib/api.ts     — remove NEXT_PUBLIC_ML_SERVICE_URL usage; remove :5000 dead ref
```

---

### PHASE 4 — Fix and retrain ML engine

**Modified:**
```
ml-service/data/generate_dataset.py — overlapping distributions, label noise 1-3%,
                                       temporal features, 6 fraud typologies, benign hard cases,
                                       faker with example.org emails
ml-service/models/train.py           — time-based split, probability calibration, PR thresholds,
                                       4-band triage, leakage check, model versioning in metrics
ml-service/src/config.py             — 4-band thresholds (LOW/MEDIUM/HIGH/CRITICAL)
ml-service/src/schemas.py            — extend response with Optional fields (backward compat):
                                       model_version, calibrated_probability, risk_band, top_reasons[]
ml-service/src/engine.py             — add evaluate_batch(), model_version in responses
```

**New:**
```
ml-service/MODEL_CARD.md             — use, provenance, limitations, disclaimer
ml-service/tests/test_ml_quality.py  — no-leakage, determinism, monotonic sanity, batch==single
```

---

### PHASE 5 — ML integration + Transactions module

**New:**
```
backend/app/services/scoring.py      — timeout, retry, circuit breaker; persists risk_assessments
backend/app/api/v1/transactions.py   — keyset pagination, combined filters, bulk-score toggle
frontend/src/app/transactions/page.tsx        — filter bar, virtualised table, URL-synced state
frontend/src/app/transactions/[id]/page.tsx   — SHAP detail, device, related txns
frontend/src/components/transactions/FilterBar.tsx, TransactionListRow.tsx, BulkActionBar.tsx,
                                              ScoringUnavailableBanner.tsx
```

**Modified:**
```
frontend/src/app/dashboard/page.tsx  — DB-driven KPIs, no fake client counters
frontend/src/components/StatsCards.tsx — accept server props
```

---

### PHASE 6 — Case management

**New:**
```
backend/app/api/v1/cases.py, services/case_state_machine.py
backend/tests/test_cases.py
frontend/src/app/cases/page.tsx, cases/[id]/page.tsx
frontend/src/components/cases/CaseKanban.tsx, CaseTimeline.tsx, CaseNoteEditor.tsx,
                                             EntityGraph.tsx, AnalystFeedbackButton.tsx
```

---

### PHASE 7 — Audit logs + reports

**New:**
```
backend/app/services/audit.py        — append-only, hash chain, tamper detection
backend/app/services/report_gen.py   — PDF (reportlab) + CSV, watermark, SHA-256
backend/app/api/v1/audit.py, reports.py
backend/tests/test_audit.py
frontend/src/app/audit/page.tsx, reports/page.tsx
```

---

### PHASE 8 — Testing + hardening

**New:**
```
frontend/e2e/                        — Playwright (or @testing-library fallback if Playwright unavailable)
backend/tests/test_security.py       — OWASP ASVS L1 items
docs/SECURITY.md                     — ASVS checklist + STRIDE threat model (1 page)
```

---

### PHASE 9 — Demo deployment package

**New/Modified:**
```
docker-compose.yml      — finalized
Makefile                — make demo, make reset-demo
docs/DEMO.md            — 10-min scripted walkthrough, demo officer credentials
README.md               — rewritten: what it is/isn't, architecture, data disclaimer
.env.example            — all required env vars
```

---

## 5. RISKS AND CONCERNS

| # | Risk | Severity | Mitigation |
|---|------|----------|------------|
| R1 | `middleware.js` deprecated → must use `proxy.ts` with `export function proxy` | **CRITICAL** | Document in Phase 3; fail CI if `middleware.ts` found in repo |
| R2 | ML data near-perfectly separable → metrics not credible | HIGH | Rewrite dataset generator in Phase 4; add leakage check |
| R3 | `cookies()` is async in Next.js 16 — sync calls throw at runtime | HIGH | All session reads use `await cookies()` |
| R4 | argon2-cffi may need Xcode CLI tools on macOS arm64 | MEDIUM | Verify in Phase 2 before claiming it works |
| R5 | SQLite concurrent writes (WAL required) | MEDIUM | `PRAGMA journal_mode=WAL`, connection pool=1 for writes |
| R6 | PDF generation library (reportlab vs weasyprint) | MEDIUM | Default: `reportlab` (no system deps) |
| R7 | Playwright driver 404 on this machine (seen during audit) | MEDIUM | Flag in Phase 8; use @testing-library integration tests as fallback |
| R8 | Batch SHAP (500 items) may exceed memory | LOW | Cap at 100 items, document limit |
| R9 | mockData uses plausible real Indian names | LOW | Fix in Phase 1 |

## 6. ITEMS IN PROMPT I FLAGGED AS INCORRECT OR UNSAFE

| Item | Issue | Proposed default |
|------|-------|-----------------|
| TOTP 2FA in Phase 3 | Very large scope addition on top of already large Phase 3 | Wire feature flag + TODO; skip actual TOTP implementation unless gate-3 explicitly expands scope |
| "virtualised table for ≥ 5k rows" | No virtualisation library installed | Add `@tanstack/virtual` in Phase 5 |
| Batch endpoint "≤ 500 items" | 500 SHAP computations may OOM | Cap at 100 items, document the limit |
| "Playwright E2E" in Phase 8 | Playwright driver 404 in current environment | Flag at Phase 8; document fallback |
