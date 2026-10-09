# eSchool — Security

Children's data, medical details and money live in this system. Default is deny: a user sees and changes only what a permission **and** a scope allow.

## 1. Authentication

| Item | Design |
|---|---|
| Login identifier | Email, phone, or (parents) a child's admission number + password. Parents may also use email + one-time code. Parent logins are created at admission with a temporary password that must be changed at first sign-in. |
| Password storage | Argon2id (memory 64 MB, t=3). Minimum 8 chars, breached/common-password check. |
| Access token | JWT, 15 min, signed HS256 (secret from env, rotated), claims: `sub`, `sid` (session id), `ver` (user token version). No permissions inside the token. |
| Refresh token | Opaque random 256-bit, stored **hashed** in `refresh_sessions`, 30 days, **rotated on every use**. Reuse of an old token revokes the whole session family (theft detection). |
| Instant revoke | Disabling a user, removing a role, or "log out all devices" increments `users.token_version` and revokes refresh sessions. Every request checks `ver` against a Redis-cached value, so disabled accounts lose access immediately (not after token expiry). |
| Brute force | Per-account and per-IP rate limits; progressive lockout (5 failures → 15 min). OTP: 5 attempts, 5 min expiry. |
| Password reset | Single-use hashed token (30 min) via email/SMS; resets revoke all sessions. |
| First login | Accounts created by admins have `must_change_password`. |
| Devices | Users can see and revoke sessions (device, platform, last used). |
| 2FA | Optional TOTP for SUPER_ADMIN, PRINCIPAL, ACCOUNTANT (enforceable by setting). |

## 2. Authorization (RBAC + scope)

1. `PolicyGuard` reads `@RequirePermission('module.action')`.
2. Loads the user's active assignments (cached in Redis, invalidated on change), filtered by `validFrom/validUntil` and the active context (`X-Active-Role`).
3. Permission missing → `403 FORBIDDEN`.
4. `ScopeService` resolves allowed IDs; repositories **must** receive a `Scope` object (type-enforced) — there is no repository method without it.
5. For single-record routes the record's `branch_id/section_id/student_id` is checked against the scope → `403 FORBIDDEN_SCOPE` (no data leakage about existence: return 404 for parents).

### 2.1 Default permission matrix (summary)

| Area | Super Admin | Principal | Coordinator / Head T. | Teacher | Helper | Accountant | Parent |
|---|---|---|---|---|---|---|---|
| Schools, branches | Full | View own | – | – | – | – | – |
| Users, roles | Full | Branch staff (no principals) | – | – | – | – | – |
| Sessions, classes | Full | Branch | View | View assigned | View assigned | View | – |
| Students | Full | Branch | Scope | Assigned sections | Assigned (limited fields) | Branch (finance fields) | Own children |
| Guardian links | Full | Approve | View | View assigned | – | – | Request |
| Attendance | Full | Branch + approve corrections | Proxy + review | Assigned, submit | Draft | – | View own children |
| Diary | Full | Moderate | Proxy + review | Assigned, publish | Draft | – | View |
| Marks / results | Full | Approve, publish | Proxy, review | Enter assigned | – | – | View published |
| Fees | Full | Monitor, approve within limit | – | – | **No** | Prepare, record, verify | View own, upload proof |
| Payroll | Full | Approve where authorized (not own) | – | Own payslip only | Own only | Prepare | – |
| Health | Full | Branch | Scope | Assigned (allergies/instructions) | Assigned (allergies) | – | Own children, propose change |
| Complaints | All | Branch | Routed | Own + routed | Own | Own + routed | Own |
| Audit | Full | Branch | – | – | – | – | – |

Hard rules (enforced in services, not just UI):
- Teachers/helpers cannot change salaries or see others' pay.
- Helpers cannot approve results, edit fees, confirm payments or change salaries.
- Parents cannot edit attendance, marks or fees.
- Nobody approves their own request (requester ≠ approver); principal's own salary/leave → higher admin.
- Amount limits on concessions/refunds/expenses per approver; above limit escalates.
- Complaints about a person are never routed to or visible to that person.

## 3. Probation, proxy and helper controls
- Probation teacher actions create approval requests; the record stays invisible to parents until approved.
- Proxy actions require `teacherwork.proxy` and scope over the section; audit stores both `performed_by` and `on_behalf_of`.
- Helper outputs are `DRAFT` only; finalization requires the responsible teacher.

## 4. Parent–child access
- A guardian sees a student only through a `VERIFIED` `student_guardians` link.
- Link verification: admission no + DOB + OTP to the phone already on the student's record, then staff approval.
- Contact changes require approval before they replace the verified contact.
- Revoking a link (custody change) takes effect immediately.
- Child switcher keeps every request scoped to one `studentId` that is re-validated on the server.

## 5. Sensitive data
| Data | Protection |
|---|---|
| Medical (allergies, conditions, incidents) | `health.*` permissions; field-level filtering by role; access logged in audit (read access logged). |
| CNIC / ID numbers | Masked in lists (`*****-*******-1`); full value only with `people.sensitive.view`. |
| Salary | Only own (staff) or payroll permission. |
| Passwords, tokens, OTPs | Hashed; never logged; never returned by API. |
| Files | Private bucket; pre-signed URLs, 5-minute expiry, issued only after permission check. |

Encryption: TLS 1.2+ everywhere (HSTS on web); disk encryption on DB server; backups encrypted (AES-256) with key separate from storage; selected columns (CNIC, medical notes) encrypted at the application layer with a KMS-managed key.

## 6. Input, files and API hardening
- DTO validation with whitelist (`forbidNonWhitelisted`); Prisma parameterised queries only (no raw string SQL with user input).
- File upload: allow-list MIME + extension (jpg, png, webp, pdf, docx); max size per type (images 5 MB, PDF 10 MB); re-encode images; strip EXIF; checksum stored; antivirus hook (ClamAV) marks `scan_status`; files served with `Content-Disposition: attachment` unless image.
- Rate limits (Redis): auth endpoints strict; general API per user; export endpoints per user/hour.
- Helmet headers, CORS allow-list (web origin only), request size limits, pagination caps (max 100).
- Errors never expose stack traces in production; correlation id per request.
- Idempotency keys for payments and offline submissions.

## 7. Web (SchoolWeb)
- Refresh token in `httpOnly; Secure; SameSite=Strict` cookie set by a Next.js route handler (BFF); access token kept in memory only.
- CSRF: SameSite=Strict + double-submit token on refresh/logout.
- CSP: `default-src 'self'`; images from storage domain; no inline scripts except Next nonce.
- No sensitive data in `localStorage`; React escapes output — no `dangerouslySetInnerHTML` with user content (rich text sanitized with DOMPurify server-side).
- Auto logout after inactivity (configurable, default 30 min for admin roles).

## 8. Android (SchoolApp)
- Tokens stored with DataStore encrypted by a key in Android Keystore (AES-GCM).
- `android:allowBackup` limited: `backup_rules.xml` / `data_extraction_rules.xml` exclude DB, datastore and cache.
- Network security config: HTTPS only (cleartext only for debug localhost/emulator); certificate pinning in release (backup pin included).
- `FLAG_SECURE` on salary, payslip, medical screens.
- No PII in logs (Timber tree strips in release); R8/minify on release builds.
- Offline drafts cleared on logout; Room DB wiped when a different user logs in.
- Optional biometric/PIN app lock for staff roles.
- Push payloads contain no sensitive data — only an id; the app fetches details after auth.

## 9. Audit
- Every create/update/state change/approval/export and every read of medical data → `audit_logs`, append-only (DB trigger blocks update/delete).
- Corrections and financial reversals require a reason; history is shown in `AuditTimeline` on the record.
- Super Admin can filter audit by user, entity, branch, date; Principal for own branch.

## 10. Operations
- Secrets only from environment / secret manager; `.env` git-ignored; `.env.example` has placeholders.
- Dependency scanning (npm audit, Gradle dependency check) in CI; pinned versions.
- Least-privilege DB user for the app (no superuser); separate read-only user for reporting.
- Backups encrypted, restore tested weekly (databaseManagement.md §8).
- Security review checklist at end of each phase (Phase 5 full review).

## 11. Incident handling
- Account compromise: Super Admin "disable + revoke all sessions" action; audit shows affected records.
- Data exposure: identify via audit logs, notify affected guardians per school policy.
- Failed notifications and job errors visible in Settings › Support.
