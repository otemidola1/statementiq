# STATEMENTIQ — Bank Statement Intelligence Platform
## Product Requirements Document — v2.0 (Supabase + Flutterwave Edition)

| Field | Value |
|---|---|
| Document Status | Ready for Development |
| Version | 2.0 — MVP (GitHub Student Pack Stack) |
| Frontend | React + Next.js 14 (App Router) |
| Backend / Database | Supabase (PostgreSQL + Auth + Storage + Edge Functions) |
| Payments | Flutterwave |
| Hosting | Vercel (frontend) + Supabase (backend) — both free tiers |

---

## 1. Product Overview

### 1.1 What Is StatementIQ?
StatementIQ is a web SaaS that converts PDF bank statements into categorized, analyzed, and visualized financial intelligence. It layers auto-categorization, visual dashboards, subscription detection, fraud flagging, income verification reports, and accounting software exports on top of the conversion.

### 1.2 The Problem
- Bank statements are locked in PDF — useless until converted and organized
- Manual re-entry into spreadsheets takes hours per statement
- Basic converter tools give raw CSV with zero intelligence
- Accountants charge per hour to do what software should automate
- Loan and mortgage applications require income verification reports that currently take 30–60 minutes each

---

## 2. Tech Stack

### 2.2 Full Stack Breakdown
- **Frontend Framework**: Next.js 14 with App Router and TypeScript
- **UI Styling**: Tailwind CSS + shadcn/ui
- **Data Fetching**: TanStack Query (React Query)
- **Backend / Database**: Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **Authentication**: Supabase Auth (email/password + Google OAuth)
- **File Storage**: Supabase Storage (S3-compatible)
- **PDF Processing**: Supabase Edge Function (pdf-parse + OCR fallback)
- **Categorization Engine**: Rule-based (merchant dictionary + regex)
- **Report Generation**: jsPDF inside Edge Functions
- **Payments**: Flutterwave
- **Email**: Resend
- **Charts**: Recharts
- **Hosting**: Vercel (frontend) + Supabase (backend)

---

## 3. Supabase Architecture

### 3.2 Database Schema
1. `profiles` — user profiles linked to auth.users
2. `upload_batches` — upload session tracking
3. `source_files` — individual uploaded files
4. `transactions` — parsed transaction rows
5. `recurring_charges` — detected subscriptions
6. `anomaly_flags` — fraud/anomaly markers
7. `reports` — generated report metadata
8. `clients` — accountant client records
9. `merchant_category_overrides` — user category corrections
10. `subscriptions` — payment/plan state
11. `merchant_category_map` — global merchant → category dictionary

### 3.4 Edge Functions
1. `process-upload` — PDF extraction, categorization, analysis
2. `generate-income-report` — Income verification PDF
3. `generate-loan-report` — Loan readiness PDF
4. `flutterwave-webhook` — Payment event handler
5. `send-email` — Transactional emails via Resend
6. `export-to-quickbooks` — QuickBooks OAuth + push

---

## 4. Flutterwave Payment Integration
- Inline JS SDK for payment modal
- Webhook verification (HMAC-SHA256)
- Manual recurring billing via tokenized cards
- pg_cron daily job for subscription renewal

---

## 5. Feature Specification

### 5.2 Core Conversion Engine (P0)
- PDF Upload (drag-and-drop, multi-file, progress)
- OCR Extraction (pdf-parse + Textract/Vision fallback)
- Multi-bank Support (100+ bank parsers)
- Batch Upload (parallel processing, merge overlapping dates)
- Gap Detector (missing month warnings)
- Duplicate Detector (review modal)
- CSV Export
- Excel Export (SheetJS)
- Google Sheets Export (P1)

### 5.3 Categorization Engine (P0)
- Layer 1: 2,000+ merchant dictionary
- Layer 2: Regex pattern matching
- Category Editing (inline dropdown)
- Category Learning (merchant_category_overrides)
- Custom Categories (P1)
- Merchant Dictionary Admin (P1)

### 5.4 Financial Dashboard (P0)
- KPI Summary Cards
- Spending by Category donut chart
- Monthly Trend line chart
- Top Merchants table
- Subscription Detector Panel

### 5.5 Income Verification Report (P0)
- PDF generation with income stats
- Shareable link (share_token, 30-day expiry)
- Report Branding for accountants (P1)

### 5.6 Fraud & Anomaly Detection (P1)
- Amount Anomaly (2.5 std dev)
- First-time Merchant Flag ($200+)
- Same-amount Multi-charge (48hr window)
- Round Number Flag ($500+)
- Flag Review UI

### 5.7 Accountant Client Portal (P1)
- Client Management
- Client Upload Token
- Branded Upload Page
- Email Invite
- Bulk Export (ZIP)

---

## 6. Pages & UI Requirements
1. Homepage / Landing (P0)
2. Sign Up / Sign In (P0)
3. Upload Page (P0)
4. Results Dashboard (P0)
5. Reports Page (P0)
6. Pricing Page (P0)
7. Account & Billing (P0)
8. Accountant Portal (P1)
9. Client Upload Page (P1)
10. Settings (P1)
11. Shared Report Page (P0)

---

## 7. Pricing Architecture
| Feature | Free | Starter $19/mo | Professional $49/mo | Accountant $99/mo |
|---|---|---|---|---|
| Pages/month | 10 | 100 | 500 | Unlimited |
| CSV & Excel | CSV only | Both | Both | Both |
| Auto-categorization | ✗ | ✓ | ✓ | ✓ |
| Dashboard & charts | ✗ | ✓ | ✓ | ✓ |
| Subscription detector | ✗ | ✓ | ✓ | ✓ |
| Google Sheets | ✗ | ✓ | ✓ | ✓ |
| Income Report | ✗ | ✗ | $15/report | Unlimited |
| Loan Report | ✗ | ✗ | $20/report | Unlimited |
| Fraud detection | ✗ | ✗ | ✓ | ✓ |
| QuickBooks/Xero | ✗ | ✗ | ✓ | ✓ |
| Accountant portal | ✗ | ✗ | ✗ | ✓ |

---

## 8. Security Requirements
- Supabase RLS on every table
- Service role key: server-side only
- Flutterwave webhook signature verification
- Private storage bucket + signed URLs
- Environment variable management
- Auth session security (7-day expiry)
- Input validation (PDF magic bytes, 50MB limit)
- CORS configuration
