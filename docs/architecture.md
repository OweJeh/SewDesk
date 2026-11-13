# SewDesk — Architecture & Engineering Specification

## 1. System Overview

SewDesk is an offline-aware, multi-tenant digital workspace designed specifically for tailors, fashion designers, bespoke clothiers, and fashion studios.

```
+-------------------------------------------------------------------------+
|                               SewDesk Web App                           |
|  (React 18, TypeScript, Tailwind CSS, Vite, React Router, TanStack Query)|
+------------------------------------+------------------------------------+
                                     |
                +--------------------+--------------------+
                |                                         |
     [Online Operations]                        [Offline Operations]
                |                                         |
                v                                         v
   +--------------------------+              +--------------------------+
   | Supabase Client SDK      |              | Dexie.js (IndexedDB)     |
   | - Auth                   |              | - Local Cache            |
   | - PostgreSQL Database    |              | - Pending Drafts         |
   | - Row Level Security     |              | - Persistent Sync Queue  |
   | - Edge Functions         |              +--------------------------+
   | - Storage Buckets        |                           |
   +--------------------------+                           |
                |                                         |
                |        Reconnection Auto-Sync           |
                +<========================================+
```

## 2. Environments

1. **Public Marketing Website:**
   - Routes: `/`, `/about`, `/features`, `/pricing`, `/login`, `/register`, `/forgot-password`, `/privacy`, `/terms`.
   - Focus: Product value proposition, customer acquisition, pricing clarity, and onboarding entry point.

2. **Business Workspace (`/app/*`):**
   - Tenant-scoped workspace for registered tailoring businesses.
   - Strict multi-tenant isolation enforced via PostgreSQL Row Level Security (RLS) and client-side workspace context.
   - Roles: Owner, Admin, Tailor, Assistant, Accountant.

3. **Platform Administration (`/platform/*`):**
   - Internal operator environment for SewDesk platform management.
   - Isolated from tenant data, guarded by `platform_admins` verification. Platform administrators do not automatically become members of tenant businesses.

## 3. Technology Choices

- **Frontend Core:** React 18, TypeScript (strict mode), Vite 6.
- **Styling & UI:** Tailwind CSS, custom luxury monochrome design system, Lucide icons, Framer Motion for subtle transitions.
- **Form & Validation:** React Hook Form + Zod for centralized schema validation.
- **State & Data Fetching:** React Context for Auth and Business tenancy, TanStack Query for caching and server synchronization.
- **Storage & Offline:** IndexedDB via Dexie.js for persistent client cache and sync queue.
- **Backend & Auth:** Supabase (PostgreSQL with RLS, GoTrue Auth, Realtime, Edge Functions).

