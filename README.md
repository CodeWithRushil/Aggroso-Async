# Marketplace Listing Quality Reviewer

An intelligent, full-stack application designed to review product and service listings against strict marketplace policies and brand-content guidelines. It couples deterministic rule validation with a cited AI review agent, field-by-field human-in-the-loop approvals, word-level visual diffing, and audit history preservation.

---

## 📑 Table of Contents
1. [Overview & Core Value](#overview--core-value)
2. [Architecture](#architecture)
3. [Completed vs. Excluded Scope](#completed-vs-excluded-scope)
4. [Setup & Running Locally](#setup--running-locally)
5. [Deterministic Validation & AI Workflow](#deterministic-validation--ai-workflow)
6. [Human-in-the-Loop Actions](#human-in-the-loop-actions)
7. [Testing Strategy](#testing-strategy)
8. [Limitations](#limitations)
9. [Deployment Details](#deployment-details)

---

## 1. Overview & Core Value

Marketplaces suffer when sellers upload listings with counterfeit claims, prohibited substances, unverifiable health cures, off-platform payment solicitations, or chaotic typography (ALL-CAPS yelling, emoji flooding). 

**Aggroso Quality Guard** provides:
- **Instant Policy Citations**: Every flagged issue is cited to a specific section (e.g., `[MP-1.2: Counterfeits & Replicas]` or `[BRAND-1.2: Typography Standards]`).
- **Unverifiable Claim Detection**: Scans for superlative claims ("best in the world"), medical claims ("100% cure"), and financial guarantees ("1000% profit").
- **Field-by-Field Actionable Suggestions**: Human reviewers can approve, edit inline, or reject proposed rewrites for Title, Description, Category, Price, Attributes, and Tags.
- **Side-by-Side Visual Token Diffing**: Highlights exact word additions and deletions.
- **Audit History**: Preserves every approval, rejection, and edit with reviewer name and timestamp.

---

## 2. Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    REACT + TYPESCRIPT CLIENT                 │
│  - Dark Obsidian Aesthetics with Glassmorphism & Micro-anims │
│  - Field-by-Field Review Workspace & Inline Text Editors     │
│  - Side-by-Side Word-Level Diff Highlighter                  │
│  - Policy & Brand Guide Explorer Modal                       │
│  - Real-Time Live AI Workflow Event Terminal                 │
└──────────────────────────────┬───────────────────────────────┘
                               │ HTTP REST API (JSON)
┌──────────────────────────────▼───────────────────────────────┐
│                    EXPRESS + NODE.JS BACKEND                 │
│  - Deterministic Rule Engine (Required fields, Price bounds, │
│    Length limits, Whitelist taxonomy, Duplicate detection)   │
│  - Policy Retrieval & Relevance Scoring Engine               │
│  - Claim Detector (Superlatives, Medical cures, Financials)  │
│  - AI Reviewer Agent (Dual mode: Gemini LLM + Offline Engine)│
│  - Structured In-Memory & File Event Logger                  │
└──────────────────────────────┬───────────────────────────────┘
                               │
┌──────────────────────────────▼───────────────────────────────┐
│                    SQLITE PERSISTENCE (SQL.JS)               │
│  - tables: listings, reviews, audit_logs                     │
│  - Atomically exported to ./data/marketplace_reviewer.sqlite │
└──────────────────────────────────────────────────────────────┘
```

### Directory Structure
```
├── client/                     # Vite + React 19 + TypeScript + Vanilla CSS
│   ├── src/
│   │   ├── components/         # StatusBadge, DiffViewer, FieldSuggestionCard, etc.
│   │   ├── services/api.ts     # Typed REST API Client
│   │   ├── types/              # Domain interfaces
│   │   └── index.css           # Vanilla CSS Design System (no Tailwind)
├── server/                     # Express + TypeScript + SQLite
│   ├── src/
│   │   ├── ai/                 # reviewerAgent.ts, claimDetector.ts
│   │   ├── db/                 # SQL.js database manager, schema, and seed data
│   │   ├── logger/             # Structured JSON logger
│   │   ├── policies/           # marketplacePolicy.ts, brandGuide.ts, policyEngine.ts
│   │   ├── routes/             # listings, reviews, batch, policies, logs
│   │   └── validators/         # deterministic.ts
│   └── tests/                  # Vitest comprehensive test suites
├── Dockerfile                  # Multi-stage container build
├── README.md                   # System documentation
├── AGENT_USAGE.md              # Agent tools, prompts, mistakes & verifications
└── .env.example                # Configuration template
```

---

## 3. Completed vs. Excluded Scope

### Completed Scope
- **Listing Fields**: Title, Description, Category, Price, Attributes (structured key-value), Seller, Optional Tags.
- **Deterministic Validation**:
  - Required fields check (Title, Description, Category, Price, Seller)
  - Price format, bounds ($0.50 – $1,000,000), and 2-decimal precision
  - Supported category whitelist validation
  - Title (10–150 chars) and Description (30–3000 chars) length checks
  - Duplicate listing detection by seller & normalized title
- **AI Policy Workflow**:
  - Semantic retrieval of relevant marketplace policies and brand guides
  - Severity classification: `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`
  - Explicit section citations on all findings (`[MP-1.1]`, `[MP-1.2]`, `[MP-4.1]`, `[BRAND-1.2]`, etc.)
  - Detection of unverifiable assumptions, medical cures, and financial guarantees
  - Field-by-field rewrite suggestions
- **Human-in-the-Loop Actions**:
  - Review suggestions field by field
  - Approve, edit inline, or reject revisions
  - Visual side-by-side diff with green/red word highlights
  - Batch review processing with progress indicators and metrics
  - Audit trail preserving every action, reviewer name, notes, and timestamp
- **Structured Logging & Diagnostics**:
  - In-memory event buffer with live viewer drawer in UI
- **Zero-Setup Fallback**:
  - Runs out of the box with zero external API key requirements, while seamlessly supporting `GEMINI_API_KEY` when configured.

### Excluded Scope (As Specified by Requirements)
- Direct publishing to real production marketplaces (Amazon, eBay, Shopify).
- Image moderation and computer vision scans.
- Financial payment gateways and credit card checkouts.
- Real identity / legal business entity verification for sellers.
- Unrestricted free-form product taxonomies.

---

## 4. Setup & Running Locally

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation
```bash
# Clone the repository
git clone <repo-url>
cd "Aggroso Async"

# Install dependencies for root, client, and server
npm install
npm install --prefix client
npm install --prefix server
```

### Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(Optional)* Add your `GEMINI_API_KEY` to enable Google Gemini LLM rewrites. If omitted, the deterministic semantic engine handles all reviews with 100% offline accuracy.

### Running in Development Mode
Starts both the backend (port 3001) and frontend Vite server (port 5173) concurrently:
```bash
npm run dev
```

### Running in Production Mode
Builds both client and server, then serves the React app directly from the Node server on `http://localhost:3001`:
```bash
npm run build
npm start
```

---

## 5. Deterministic Validation & AI Workflow

### Policy Citations
1. **MP-1.1**: Prohibited Goods, Weapons, and Unapproved Pharmaceuticals (`CRITICAL`)
2. **MP-1.2**: Counterfeits, Replicas, and Unauthorized Brand Usage (`CRITICAL`)
3. **MP-2.1**: Safety Certifications and Recalled Products (`HIGH`)
4. **MP-3.1**: Price Deception and Artificial Discount Claims (`HIGH`)
5. **MP-4.1**: Unverifiable, Superlative, and Medical Claims (`HIGH`)
6. **MP-5.1**: Off-Platform Diversion and Direct Seller Contact (`CRITICAL`)
7. **MP-6.1**: Category Taxonomy & Classification Compliance (`MEDIUM`)
8. **BRAND-1.1**: Professional, Objective Tone of Voice (`MEDIUM`)
9. **BRAND-1.2**: Typography, ALL-CAPS Yelling, and Emoji Formatting (`MEDIUM`)
10. **BRAND-2.1**: Complete & Structured Attribute Specifications (`LOW`)
11. **BRAND-2.2**: Condition Transparency and Warranty Terms (`HIGH`)
12. **BRAND-3.1**: Search Hygiene and Keyword Spamming Prohibition (`MEDIUM`)
13. **BRAND-3.2**: Formatting Structure and Readability (`LOW`)

---

## 6. Testing Strategy

The server includes a focused test suite using **Vitest** verifying core business logic:
- `validation.test.ts`: Required fields, category checking, price formatting/bounds, lengths, and duplicate detection.
- `policyEngine.test.ts`: Policy retrieval, relevance scoring, and citation matching.
- `claimDetector.test.ts`: Detection of medical claims, superlatives, financial profit guarantees, and physical absolutist claims.
- `reviewerAgent.test.ts`: End-to-end evaluation, scoring penalties, and rewrite suggestions.

Run tests:
```bash
npm test
```

---

## 7. Limitations

1. **Storage Engine**: Uses `sql.js` (SQLite compiled to WebAssembly) for maximum cross-platform reliability without requiring native C++ build tools on Windows. Suitable for small to medium batch catalogs. For high-throughput enterprise scale (>1,000,000 concurrent listings), migrate to PostgreSQL.
2. **Batch Concurrency**: Batch review executes sequentially to provide deterministic audit log timestamps.
3. **Language**: Current policy rules and regexes prioritize English listings.

---

## 8. Deployment Details

### Docker Deployment
The project includes a production-ready multi-stage `Dockerfile`:
```bash
# Build Docker image
docker build -t marketplace-listing-reviewer .

# Run container
docker run -p 3001:3001 -e PORT=3001 marketplace-listing-reviewer
```
Open `http://localhost:3001` in your web browser.

### Cloud Platform Deployment (Render / Railway / Fly.io)
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Environment Variables**:
  - `PORT`: `3001` (or assigned by platform)
  - `NODE_ENV`: `production`
  - `GEMINI_API_KEY`: *(Optional)*
