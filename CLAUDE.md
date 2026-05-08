# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # start dev server (localhost:3000)
npm run build    # type-check + production build
npm run lint     # ESLint
```

## Architecture

**Next.js 16 (App Router) + Supabase + AES-256-GCM encryption**

Personal internal tool for storing server credentials (SSH, database, API keys, env vars) with all sensitive values encrypted before hitting the database.

### Security model
- `MASTER_KEY` (32-byte hex) lives only in `.env.local` — never stored in Supabase
- `lib/crypto.ts` (server-only via `import "server-only"`) handles all encrypt/decrypt using Node `crypto` AES-256-GCM
- Plaintext values never reach the client; decryption happens in Server Actions only on explicit user action
- Supabase RLS (`user_id = auth.uid()`) is the second layer

### Key files
- `lib/crypto.ts` — `encrypt()` / `decrypt()` — server-only, all secret ops go here
- `lib/supabase/server.ts` — `createClient()` for Server Actions / Server Components
- `lib/supabase/client.ts` — `createBrowserClient()` for client components (login page only)
- `middleware.ts` — session refresh + auth redirect guard
- `actions/credentials.ts` — CRUD + `revealCredential()` Server Action (decrypts on demand)
- `actions/servers.ts` — server grouping CRUD
- `supabase/schema.sql` — run in Supabase SQL editor to set up tables + RLS

### Route groups
- `app/(auth)/login` — magic-link login, no auth required
- `app/(dashboard)/` — credentials list (filterable by type + server)
- `app/(dashboard)/servers` — server management (public_ip, local_ip, tags)
- `app/(dashboard)/credentials/new` — add any credential type
- `app/(dashboard)/credentials/[id]` — edit credential
- `app/auth/callback` — Supabase OAuth code exchange

### Credential types
`ssh` | `database` | `api_key` | `env` — stored in `credentials.type`; `database` type also stores `metadata.host`, `metadata.port`, `metadata.database` (plaintext, non-secret).

### Env vars required
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
MASTER_KEY   # openssl rand -hex 32
```
