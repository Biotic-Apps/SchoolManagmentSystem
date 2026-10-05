# SchoolWeb

Web panel of the eSchool Management System — Next.js (App Router), TypeScript, Tailwind CSS v4, TanStack Query, react-hook-form + zod, Radix primitives, lucide icons.

See `../docs/architecture.md` (§8 web, §10 design system) and `../docs/navigation.md` (menu contract).

## Run

```bash
cp .env.example .env.local
npm install
npm run dev      # http://localhost:3001 (the API uses 3000)
npm run lint
npm run build
```

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | API base URL, e.g. `http://localhost:3000/api/v1` |
| `API_URL` | Server-only API URL for the auth BFF; defaults to `NEXT_PUBLIC_API_URL` |
| `REFRESH_TTL_DAYS` | Refresh-cookie lifetime (default 30, match the API) |
| `NEXT_PUBLIC_IDLE_TIMEOUT_MINUTES` | Auto sign-out after inactivity (default 30) |
| `NEXT_PUBLIC_ASSET_ORIGINS` | Extra CSP origins for images, e.g. the S3 bucket URL |
| `NEXT_PUBLIC_DEMO_ROLE` | Dev only. Loads a demo session to preview the shell per role, e.g. `PRINCIPAL` or `TEACHER,PARENT` (first is active). Ignored in production builds. |

## Auth (security.md §7)

`src/app/api/auth/{login,refresh,logout}` is a small BFF: it calls the API, keeps the refresh token in an
httpOnly `SameSite=Strict` cookie (Secure in production) and returns only the access token, which stays in memory.
Refresh/logout require a double-submit CSRF token. `src/proxy.ts` redirects anonymous visitors to `/login`
and sets a per-request nonce CSP; other security headers live in `next.config.ts`.

## Layout

```
src/
├─ app/                 thin routes: (auth)/login, (portal)/dashboard, (portal)/[module]
├─ components/ui/       primitives (Button, Input, Select, Card, Dialog, Table, ...)
├─ components/shared/   composed blocks (DataTable, PageHeader, FormField, StatCard, ...)
├─ components/layout/   PortalShell, Sidebar, Topbar, mobile drawer
├─ config/              navigation catalogue, roles, module phases
├─ features/<module>/   api.ts hooks, schemas.ts, types.ts, components/
└─ lib/                 http client, query client, permissions, formatters
```

Design tokens live in `src/app/globals.css` and are exposed as Tailwind classes (`bg-primary`, `text-fg-muted`, `bg-selected`, `rounded-card`, `text-page-title`, ...). Components use token classes only — never raw hex values.
