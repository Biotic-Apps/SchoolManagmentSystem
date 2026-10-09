# Phase 4 API Contract (Finance & Results)

Same conventions as phase1–3 contracts incl. all **Deviations** sections (envelope, paging, scope, 404 for parents outside their children, ProbationGate (P), proxy (X), clientRequestId (O), school time zone APP_TIMEZONE). Flows: [backendFlows.md](../backendFlows.md) §16–22, §24. Money = integer `amountMinor` + `currency` ("PKR"); never floats. Every mutation audited; every financial correction keeps reason + history.

## A. Exams, results and promotion

### A1. Grading schemes
| Method | Path | Permission |
|---|---|---|
| GET/POST | `/grading-schemes?schoolId=&sessionId=` | `exams.view` / `exams.add` `{ schoolId, sessionId, name, passPercent, bands: { grade, minPercent, maxPercent, remark?, gradePoint? }[] }` (bands must cover 0–100 without overlap → else 400) |
| PATCH | `/grading-schemes/:id` | `exams.edit` (only while no exam using it is RESULTS_APPROVED) |
| POST | `/grading-schemes/:id/approve` | `exams.approve` |

### A2. Exams
```
Exam: DRAFT → SCHEDULED → MARKS_OPEN → MARKS_CLOSED → RESULTS_APPROVED → PUBLISHED
MarkSheet (examSubject × section): NOT_ENTERED → DRAFT → SUBMITTED (P)(X) → ACCEPTED | RETURNED → (edit) DRAFT
```
| Method | Path | Permission |
|---|---|---|
| GET/POST | `/exams?branchId=&sessionId=&termId=&status=` | `exams.view` / `exams.add` `{ branchId, sessionId, termId?, name, type: "TERM"\|"MIDTERM"\|"UNIT_TEST"\|"FINAL", gradingSchemeId, weightPercent?, classIds: string[] }` |
| GET/PATCH | `/exams/:id` | view / edit (DRAFT/SCHEDULED) |
| PUT | `/exams/:id/schedule` | `exams.edit` `{ papers: { classId, subjectId, date, startTime, endTime, maxMarks, passMarks, roomId? }[] }` → SCHEDULED (clash check: same class same slot, room double booked → 409 with details) |
| POST | `/exams/:id/status` | `exams.edit` `{ status: "MARKS_OPEN"\|"MARKS_CLOSED" }` |
| GET | `/exams/:id/mark-sheets?sectionId=&subjectId=` | view (teacher: own subject-sections) → `MarkSheet[]` with completeness |
| GET | `/mark-sheets/:id` | view → `MarkSheet` with rows |
| PUT | `/mark-sheets/:id` | `exams.edit` assigned subject teacher or proxy `{ rows: { studentId, marks: number\|null, absent: boolean, remark? }[], clientRequestId? }` → DRAFT **(X)(O)**; marks > maxMarks → 400; `null` = pending (never 0) |
| POST | `/mark-sheets/:id/submit` | `exams.submit` **(P)(X)** → SUBMITTED; 400 if any row is still pending (not entered and not absent) |
| POST | `/mark-sheets/:id/accept` · `/return` | `exams.approve` (coordinator/principal) `{ comment? }` |
| GET | `/exams/:id/completeness?branchId=` | view → per class/section/subject `{ status, entered, total }` |
| POST | `/exams/:id/compute` | `exams.approve` → job computes results (totals, %, grade, position per section, pass/fail per subject) → `{ jobId }` |
| POST | `/exams/:id/approve-results` | `exams.approve` → approval `RESULT_PUBLISH` (principal) → RESULTS_APPROVED; requires all sheets ACCEPTED (409 with list) |
| POST | `/exams/:id/publish` | `exams.publish` → PUBLISHED; report-card PDF job per student; guardians notified |
| GET | `/results?examId=&sectionId=` | view (parent: own child, PUBLISHED only) → `StudentResult[]` |
| GET | `/students/:id/results` | view → all published results + progress trend |
| GET | `/students/:id/report-cards?examId=` | view → `{ status, fileUrl, generatedAt }` |
```ts
MarkSheet = { id, examId, paper: { classId, className, subject: {id,name}, maxMarks, passMarks, date }, sectionId, sectionName,
  status, teacher: {id,name}|null, entered, total, comment, rows: { studentId, name, rollNo, marks: number|null, absent, remark }[] }
StudentResult = { studentId, name, rollNo, examId, subjects: { subjectId, name, marks, maxMarks, absent, grade, passed }[],
  totalMarks, maxTotal, percent, grade, position, passed, remarks, teacherRemark }
```

### A2b. Behaviour & skills, positions, bulk prints (added 2026-10-09)
| Method | Path | Rule |
|---|---|---|
| GET | `/branches/:id/skills` | `exams.view`, branch reader → `SkillConfig`. A branch without items/scale gets the defaults on first read (existing branches seeded by migration `20261009150000_behaviour_skills`). |
| PUT | `/branches/:id/skills` | `exams.edit` + branch management (principal/coordinator) → `SkillConfig`. Body `{ items: { id?, domain, name }[], scale: { value, code, label }[] }`; list order = card order per domain; scale values must be 1..N (2–10 levels, distinct codes). Removed items that have ratings become inactive (kept on old cards), others are deleted. 409 when existing ratings use a level above the new N. Audited `skills.config_update`. |
| GET | `/exams/:id/skills?sectionId=` | `exams.view`; branch managers or a teacher of the section (class or subject assignment) → `SkillGrid`. Parents 404. Section must sit the exam (400). |
| PUT | `/exams/:id/skills` | `exams.edit`, same reach → `SkillGrid`. Body `{ sectionId, ratings: { studentId, itemId, value: 1..N \| null }[] }` (null clears; ≤ 4000). 400 `{ problems }` for students outside the section, inactive items, values outside the scale; 409 once the exam is PUBLISHED. Audited `exam.skills_rate`. |
| POST | `/exams/:id/print` | `exams.view`, staff reach → `{ jobId }` (poll `GET /jobs/:jobId`; `result.fileUrl` and `result.count`). Body `{ kind, sectionId?, classId?, subjectId? }`. `sectionId` = one section (403 if not yours); `classId` = every section of the class you reach; neither = every exam class you reach. Audited `exam.print`. |
| POST | `/students/id-cards/print` | `students.edit`; body `{ sectionId }` or `{ branchId, classId? }` (current sections of the active session you reach) → `{ jobId, count }`. A4 sheets, 10 CR80 cards per page with cut marks; card versions are not changed. Max 1500 cards (409). Audited `student.id_card_sheet`. |

Print kinds: `REPORT_CARDS` (one card per computed result, sections in class order, roll order inside; "PROVISIONAL" watermark before publishing; 409 when no results), `DATE_SHEET` (one page per class: date, day, time, subject, max/pass, room), `AWARD_LIST` (blank marks sheet per section: Sr, roll, name, one column per subject with max marks + total, two spare rows, signature lines; with `subjectId` a single-paper sheet with marks / in words / remarks). 409 when the exam has no schedule (date sheet, award list).

```ts
SkillConfig = { branchId, items: SkillItem[], scale: { value, code, label }[] /* highest first */ }
SkillItem = { id, domain: "AFFECTIVE" | "PSYCHOMOTOR", name, sortOrder }
SkillGrid = { examId, sectionId, editable /* false once PUBLISHED */, items: SkillItem[], scale, complete /* students fully rated */,
  students: { studentId, name, rollNo, ratings: Record<itemId, value> }[] }
StudentResult += { sectionSize, classPosition /* rank across the class's sections; null when positions are off */, classSize }
PublishedResult (GET /students/:id/results) += { skills: { domain, name, value, code, label }[] }
```
Report card PDF: subjects table, a summary row (percentage, grade, "4th of 10" in section, "7th of 20" in class, result), the behaviour & skills table (affective | psychomotor side by side, with the scale key), remarks and signature lines. Cards rendered before 2026-10-09 are re-rendered once (new version) the next time `GET /students/:id/report-cards` is called for a published exam.

### A3. Teacher feedback / progress
| Method | Path | Permission |
|---|---|---|
| GET/POST | `/students/:id/progress-notes` | `progress.view` / `progress.edit` (assigned teacher, proxy) `{ category: "HOMEWORK"\|"BEHAVIOUR"\|"LEARNING"\|"ACHIEVEMENT", note, visibleToParent: boolean }` **(P)** |
| GET | `/students/:id/homework-completion?from=&to=` | view → from diary homework + teacher ticks |
| PUT | `/diary/:id/homework-status` | `progress.edit` `{ entries: { studentId, status: "DONE"\|"PARTIAL"\|"NOT_DONE" }[] }` |

### A4. Promotion
```
Decision: SUGGESTED → CONFIRMED (approval PROMOTION) → APPLIED (creates next-session enrollment on effectiveDate)
```
| Method | Path | Permission |
|---|---|---|
| POST | `/promotions/suggest` | `exams.approve` `{ branchId, fromSessionId, toSessionId, examIds: string[] }` → job builds suggestions per student: PROMOTE / REPEAT / CONDITIONAL / GRADUATE (last class) from rules |
| GET | `/promotions?branchId=&fromSessionId=&classId=&decision=` | view → `PromotionRow[]` |
| PATCH | `/promotions/:id` | `exams.approve` `{ decision, toSectionId?, reason? }` (manual override needs reason) |
| POST | `/promotions/confirm` | principal `{ branchId, fromSessionId, classId? }` → approval `PROMOTION` |
| POST | `/promotions/apply` | after approval `{ branchId, fromSessionId, effectiveDate }` → enrollments PROMOTED/REPEATED/GRADUATED + new ACTIVE enrollments; history kept |

## B. Fees, payments and dues

### B1. Structure
| Method | Path | Permission |
|---|---|---|
| GET/POST | `/fee-heads?schoolId=` | `fees.view` / `fees.add` `{ schoolId, code, name, kind: "RECURRING"\|"ONE_TIME", refundable: boolean }` |
| GET/POST | `/fee-plans?branchId=&sessionId=` | view / add `{ branchId, sessionId, classId, name, items: { feeHeadId, amountMinor, frequency: "MONTHLY"\|"QUARTERLY"\|"TERM"\|"YEARLY"\|"ONCE", dueDay }[], lateFee: { amountMinor, afterDays } \| null }` |
| PATCH | `/fee-plans/:id` | `fees.edit` (changes apply to invoices generated after approval) |
| POST | `/fee-plans/:id/approve` | `fees.approve` |

### B2. Invoices
```
DRAFT → ISSUED → PARTIALLY_PAID → PAID ; ISSUED|PARTIALLY_PAID → OVERDUE (job) ; DRAFT|ISSUED → CANCELLED (approval, reason)
```
| Method | Path | Permission |
|---|---|---|
| POST | `/invoices/generate` | `fees.add` `{ branchId, sessionId, period: "YYYY-MM", classIds? }` → job creates DRAFT invoices from approved plans (+ active concessions, + trip/activity fees, + late fees) → `{ jobId }`; idempotent per student+period |
| GET | `/invoices?branchId=&period=&status=&classId=&studentId=&search=` | view (parent: own children) |
| GET | `/invoices/:id` | view → `Invoice` |
| POST | `/invoices/issue` | `fees.approve` `{ invoiceIds }` → ISSUED; guardians notified |
| POST | `/invoices` | `fees.add` ad-hoc `{ studentId, dueDate, lines: { feeHeadId, description, amountMinor }[] }` (DRAFT) |
| POST | `/invoices/:id/cancel` | `fees.edit` `{ reason }` → approval if ISSUED |
| GET | `/invoices/:id/pdf` | view → challan PDF url (job) |
| POST | `/invoices/challans/print` | view `{ branchId, period, classId?, sectionId? }` → 200 `{ jobId, count }`; one PDF of bank challans (see Deviations) |
```ts
Invoice = { id, invoiceNo, student: {id,name,admissionNo,className,sectionName}, period, issueDate, dueDate, status,
  lines: { id, feeHead: {id,name}, description, amountMinor }[], concessionMinor, lateFeeMinor, totalMinor, paidMinor, balanceMinor,
  payments: { paymentId, receiptNo, amountMinor, paidOn }[], currency }
```
`invoiceNo` = `INV-{BRANCH}-{YYYYMM}-{SEQ}`.

### B3. Payments
```
Proof: SUBMITTED → VERIFIED (creates Payment) | REJECTED(reason)    — uploaded proof alone never marks paid
Payment: RECORDED (allocated) ; reversal → approval PAYMENT_REVERSAL → REVERSED (new negative ledger entry)
```
| Method | Path | Permission |
|---|---|---|
| POST | `/payment-proofs` | PARENT (if branch setting `fees.proofUpload` true) `{ invoiceId, amountMinor, paidOn, method: "BANK"\|"WALLET"\|"OTHER", reference, fileId }` |
| GET | `/payment-proofs?branchId=&status=` | `fees.view` |
| POST | `/payment-proofs/:id/verify` · `/reject` | `fees.approve` (accountant) `{ receivedOn?, note? }` / `{ reason }` |
| POST | `/payments` | `fees.add` (cashier/accountant) `{ studentId, amountMinor, method: "CASH"\|"BANK"\|"CHEQUE"\|"ONLINE", reference?, receivedOn, allocations?: { invoiceId, amountMinor }[], clientRequestId? }` — default allocation oldest due first; overpayment kept as advance credit |
| GET | `/payments?branchId=&from=&to=&method=&cashierId=` | view |
| GET | `/payments/:id/receipt?format=a4\|thermal` | view → receipt PDF url (job); receipt no `RCT-{BRANCH}-{YEAR}-{SEQ}` |
| POST | `/payments/:id/reverse` | `fees.edit` `{ reason }` → approval `PAYMENT_REVERSAL` |
| POST | `/payments/online/initiate` | PARENT `{ invoiceId }` → `{ gateway, redirectUrl }` — `409 GATEWAY_DISABLED` while `fees.onlineGateway` is "NONE" (default) |
| POST | `/payments/online/callback/:gateway` | public, signature-verified by adapter |
Gateway adapter interface: `PaymentGateway { initiate(invoice), verifyCallback(req), refund(payment, amount) }`; implementations: `ManualGateway` (default, disabled online), stubs for JazzCash/Easypaisa must not be faked — leave only the interface + registry.

### B4. Concessions, refunds, write-offs
| Method | Path | Permission |
|---|---|---|
| GET/POST | `/concessions?studentId=&status=` | `fees.view` / `fees.add` `{ studentId, feeHeadId?, type: "PERCENT"\|"FIXED", value, from: "YYYY-MM", to?: "YYYY-MM", reason }` → approval `CONCESSION` (limit per approver from `approval.limits.CONCESSION`; above → escalates) |
| POST | `/refunds` | `fees.add` `{ paymentId, amountMinor, reason, method }` → approval `REFUND` |
| GET | `/students/:id/ledger` | view (parent: own child) → ledger entries + running balance |
| GET | `/students/:id/fee-summary` | view → `{ totalDueMinor, overdueMinor, advanceMinor, lastPayment, nextDue }` |

### B5. Dues and collections
| Method | Path | Permission |
|---|---|---|
| GET | `/dues?branchId=&classId=&minDays=&search=` | `fees.view` → students with balance, aging buckets 0–30/31–60/61–90/90+ |
| POST | `/dues/reminders` | `fees.edit` `{ studentIds }` → notification job |
| GET | `/collections/daily?branchId=&date=` | view → totals per method and per cashier, list of payments |
| POST | `/collections/daily/close` | `fees.approve` `{ branchId, date, cashCountedMinor, note? }` → stores difference; closed day blocks new back-dated cash payments (423) |

## C. Payroll
```
Run (branch, month): DRAFT → CALCULATED → REVIEWED → APPROVED (approval PAYROLL) → PARTIALLY_PAID → PAID → CLOSED
```
| Method | Path | Permission |
|---|---|---|
| GET/PUT | `/staff/:id/salary-structure` | `payroll.view` / `payroll.edit` `{ effectiveFrom: "YYYY-MM", basicMinor, allowances: { name, amountMinor }[], deductions: { name, amountMinor }[] }` (history kept) |
| GET/POST | `/payroll/adjustments?staffId=&month=` | view / edit `{ staffId, month, kind: "BONUS"\|"DEDUCTION"\|"ADVANCE"\|"ARREAR", amountMinor, reason }` (approved with the run) |
| POST | `/payroll/runs` | `payroll.add` `{ branchId, month: "YYYY-MM" }` → DRAFT (409 if exists) |
| POST | `/payroll/runs/:id/calculate` | `payroll.edit` → job: basic + allowances − deductions − unpaid leave days (from staff attendance/leave) ± adjustments → CALCULATED |
| GET | `/payroll/runs?branchId=&month=` · `/payroll/runs/:id` | view → run + lines |
| POST | `/payroll/runs/:id/review` | `payroll.edit` → REVIEWED |
| POST | `/payroll/runs/:id/approve` | `payroll.approve` → approval `PAYROLL`; the line of an approver's own salary (e.g. principal) is routed to SUPER_ADMIN; self-approval blocked |
| POST | `/payroll/runs/:id/payments` | `payroll.edit` `{ staffId, amountMinor, method, reference?, paidOn }` (partial allowed; balance visible) |
| POST | `/payroll/runs/:id/close` | `payroll.approve` (all lines paid) |
| GET | `/payslips/me?month=` · `/payslips/:staffId?month=` | self / `payroll.view` → payslip + PDF url |
```ts
PayrollLine = { staffId, name, designation, basicMinor, allowancesMinor, deductionsMinor, unpaidLeaveDays, leaveDeductionMinor,
  adjustmentsMinor, netMinor, paidMinor, balanceMinor, status }
```
Teachers/helpers can only read their own payslips; salary screens use FLAG_SECURE on Android.

## D. Expenses and vendors
| Method | Path | Permission |
|---|---|---|
| GET/POST | `/vendors?search=` | `expenses.view` / `expenses.add` `{ name, contactPerson?, phone?, email?, address?, ntn? }` |
| GET/POST | `/expense-categories?schoolId=` | view / add (seed: RENT, UTILITIES, SUPPLIES, REPAIRS, MAINTENANCE, TRANSPORT, SALARY_OTHER, OTHER) |
| GET/POST | `/expenses?branchId=&categoryId=&status=&from=&to=` | view / add `{ branchId, categoryId, vendorId?, title, amountMinor, billDate, dueDate?, billFileId?, recurring?: { monthly: true, untilMonth? } , notes? }` → DRAFT |
| POST | `/expenses/:id/submit` | add → SUBMITTED → approval `EXPENSE` (limits) |
| POST | `/expenses/:id/payments` | `expenses.edit` `{ amountMinor, method, reference?, paidOn }` (partial allowed) → PAID when settled |
Job `expenses.recurring` creates next month's DRAFT on the 1st.

## E. Inventory and purchasing
| Method | Path | Permission |
|---|---|---|
| GET/POST | `/inventory/items?branchId=&category=&lowStock=` | `inventory.view` / `inventory.add` `{ schoolId, sku, name, category: "FURNITURE"\|"COMPUTER"\|"STATIONERY"\|"UNIFORM"\|"BOOK"\|"SPORTS"\|"OTHER", unit, reorderLevel, isAsset: boolean, saleable: boolean, salePriceMinor? }` |
| GET | `/inventory/stock?branchId=` | view → per item quantity (= sum of movements) |
| POST | `/inventory/movements` | `inventory.edit` `{ branchId, itemId, type: "IN"\|"ISSUE"\|"ADJUST"\|"TRANSFER_OUT"\|"TRANSFER_IN", quantity, toBranchId?, issuedTo?, reason? }` (ADJUST requires reason; negative stock → 409) |
| GET/POST | `/assets?branchId=` · `PATCH /assets/:id` | view / edit `{ itemId, tag, location, condition: "NEW"\|"GOOD"\|"FAIR"\|"POOR"\|"DISPOSED", assignedTo? }` |
| GET/POST | `/purchase-requests?branchId=&status=` | view / add `{ branchId, lines: { itemId, quantity, estimatedUnitMinor }[], reason }` → approval `PURCHASE_ORDER` |
| POST | `/purchase-requests/:id/order` | `inventory.edit` `{ vendorId, lines: { itemId, quantity, unitPriceMinor }[], expectedOn? }` → PO `PO-{BRANCH}-{YEAR}-{SEQ}` |
| POST | `/purchase-orders/:id/receive` | `inventory.edit` `{ lines: { itemId, quantity }[], receivedOn }` (partial ok; creates IN movements) |
| POST | `/purchase-orders/:id/bill` | `expenses.add` → creates linked Expense (vendor bill) |
| POST | `/inventory/sales` | `fees.add` `{ studentId, lines: { itemId, quantity }[] }` → ISSUE movements + invoice lines (uniform/books) |
Job `inventory.lowStock` daily notification.

## F. Certificates
```
REQUESTED → APPROVED (principal) → ISSUED (PDF, serial, QR) ; ISSUED → reissue (duplicate, same serial + "DUPLICATE")
```
| Method | Path | Permission |
|---|---|---|
| POST | `/certificates` | `certificates.add` (office) or PARENT request `{ studentId, type: "SCHOOL_LEAVING"\|"TRANSFER"\|"CHARACTER"\|"ATTENDANCE"\|"ACHIEVEMENT", purpose?, details?: { activityId?, achievement? } }` |
| GET | `/certificates?branchId=&type=&status=&studentId=` | view (parent: own child) |
| POST | `/certificates/:id/approve` · `/reject` | `certificates.approve` — SCHOOL_LEAVING/TRANSFER require clearance: no outstanding balance, no unreturned issued items → `409 CLEARANCE_REQUIRED` with details |
| POST | `/certificates/:id/issue` | `certificates.add` → PDF job; serial `CERT-{TYPE}-{YEAR}-{SEQ}`; SCHOOL_LEAVING also withdraws the student (effective date) |
| POST | `/certificates/:id/reissue` | `certificates.add` `{ reason }` |
| GET | `/certificates/verify/:serial` | public → `{ valid, type, studentName, issuedOn }` (QR target; no other data) |

## G. Reports and exports
`GET /reports/catalog` → available reports per role. `POST /reports` `{ key, params, format: "PDF"\|"XLSX"\|"CSV" }` → `{ jobId }`; `GET /reports/:jobId` → `{ status, fileUrl }`. Keys: `attendance.monthly`, `attendance.staff`, `syllabus.coverage`, `results.analysis`, `fees.collection`, `fees.aging`, `fees.defaulters`, `payroll.summary`, `expenses.summary`, `inventory.stock`, `branch.comparison` (super admin). All scoped; generated in the `reports` queue.
`GET /dashboard/finance?branchId=&month=` (`fees.view`) → `{ billedMinor, collectedMinor, outstandingMinor, overdueMinor, collectionRate, expensesMinor, payrollMinor, todayCollectedMinor }`.

## H. Branch settings added
`fees.proofUpload` (true), `fees.onlineGateway` ("NONE"), `fees.receiptFooter` (""), `fees.bankAccount` (`{ bankName, accountTitle, accountNumber, branchCode }`, all ""), `fees.challanNote` (""), `approval.limits.CONCESSION|REFUND|EXPENSE|PURCHASE_ORDER` (amountMinor per role), `exams.positionsEnabled` (true), `promotion.minPassPercent` (33).

## I. New error codes
`CLEARANCE_REQUIRED` (409), `GATEWAY_DISABLED` (409), `DAY_CLOSED` (423), `NEGATIVE_STOCK` (409).

## J. Seed additions (dev)
- Grading scheme (A+ 90–100 … F 0–32, pass 33%); Mid-term exam for Class 4–5 PUBLISHED with marks + results + report cards; Final exam MARKS_OPEN with 5-A Maths DRAFT and 5-B English SUBMITTED.
- Fee heads (Tuition, Admission, Exam, Transport, Computer Lab), plans for Class 1–5; invoices for last 3 months: mix of PAID, PARTIALLY_PAID, OVERDUE; one parent payment proof SUBMITTED for `parent@`'s child; one concession PENDING; daily collection for yesterday closed.
- Salary structures for all staff; last month's payroll run PAID, current month CALCULATED.
- Vendors (3), expenses (rent recurring, electricity PAID, repairs SUBMITTED).
- Inventory items (chairs as assets, notebooks, uniforms saleable) with stock; one PO partially received; a low-stock item.
- Certificates: one CHARACTER ISSUED, one SCHOOL_LEAVING REQUESTED blocked by dues.

## Deviations (as implemented in SchoolApi)
Paths and documented fields are unchanged unless listed. Additions and clarifications:
- **Jobs**: every `{ jobId }` (invoice generation, compute results, promotions suggest, payroll calculate, dues reminders, reports, PDFs) is pollable at `GET /jobs/:id` → `{ id, queue, name, status: "QUEUED"|"RUNNING"|"DONE"|"FAILED", progress?, result?: { fileUrl?, count?, ... }, error?, createdAt, finishedAt }`; only the user who started the job sees it (404 otherwise). PDFs are versioned per entity and rendered on the `documents` queue; a ready version is reused (`jobId` of an already DONE job).
- **Money**: amounts are integers in minor units (`amountMinor`) everywhere; inputs must be whole positive numbers. The student ledger (`ledger_entries`) and `stock_movements` are append-only (DB triggers block UPDATE/DELETE/TRUNCATE); corrections (reversal, refund, cancellation, late fee, concession) are new entries with a reason. Ledger sign: positive = owed, negative = credit/advance.
- **Errors**: `CLEARANCE_REQUIRED` (409), `GATEWAY_DISABLED` (409), `DAY_CLOSED` (423), `NEGATIVE_STOCK` (409) as in §I.
- **Approvals**: new approval type `INVOICE_CANCEL`. Amount-limited types (CONCESSION, REFUND, EXPENSE, PURCHASE_ORDER) route through roles ranked above the requester: each role in `approval.limits.<TYPE>` (`{ ROLE: amountMinor }`) approves up to its limit, above it the request escalates; the last step is unlimited (PRINCIPAL when it has no limit, else SUPER_ADMIN). Defaults: CONCESSION/REFUND `{ PRINCIPAL: 2500000 }`, EXPENSE/PURCHASE_ORDER `{ PRINCIPAL: 10000000 }`; the legacy `approval.limits[TYPE]` is read as the principal's limit. Single-step approvals (RESULT_PUBLISH, PROMOTION, PAYMENT_REVERSAL, INVOICE_CANCEL) go to the PRINCIPAL, or to SUPER_ADMIN when a principal/super admin asks.
- **Branch settings**: `fees.onlineGateway` accepts `"NONE"|"MANUAL"`; `fees.receiptFooter` free text ≤ 300; `fees.bankAccount` object with only `bankName` ≤ 80, `accountTitle` ≤ 100, `accountNumber` ≤ 34, `branchCode` ≤ 20 (unknown keys 400; principal or `settings.edit` may change it); `fees.challanNote` free text ≤ 300; `promotion.minPassPercent` 0–100.
- **Permissions**: ACCOUNTANT adds `fees.approve` (issue invoices, verify proofs, close the day) and `certificates.view`; TEACHER, COORDINATOR, HEAD_TEACHER add `progress.edit` (coordinators also `certificates.view`); PRINCIPAL adds `self.payroll.view`; PARENT adds `certificates.view/add`.
- **Files**: generated PDFs/reports use new file purposes (REPORT_CARD, CHALLAN, RECEIPT, PAYSLIP, CERTIFICATE, REPORT) that cannot be uploaded. Payslip files are readable only by the staff member or `payroll.view` holders; report files only by the requester.
- **Status codes (§A)**: `/grading-schemes/:id/approve`, `/exams/:id/status|compute|approve-results|publish`, `/mark-sheets/:id/submit|accept|return`, `/promotions/suggest|confirm|apply` return 200; creates 201.
- **Grading schemes**: bands are whole percents and must cover 0–100 contiguously (400 `details.problems`); grades use the band of ⌊percent⌋. PATCH returns the scheme to DRAFT (approve again) and is refused (409) once an exam using it is RESULTS_APPROVED/PUBLISHED; approving one's own scheme → 403; management scope over the session's branch; `GET` is a plain array.
- **Exams**: `GET /exams` is paged (parents: PUBLISHED exams of their children's branches); `ExamDto` adds `papers[]` (empty in lists), `classes[]`, `approvalId`, `computedAt`, `publishedAt`. `classIds` editable only in DRAFT. Schedule only in DRAFT/SCHEDULED and replaces the papers; field errors → 400 `details.problems[{index, problem}]` (DUPLICATE_PAPER, CLASS_NOT_IN_EXAM, SUBJECT_NOT_IN_CLASS, END_BEFORE_START, PASS_ABOVE_MAX, OUTSIDE_SESSION, ROOM_NOT_IN_BRANCH); clashes → 409 `details.clashes[{kind: CLASS|ROOM, date, first, second}]` (also against the branch's other exams). Scheduling creates one mark sheet per paper × active section (teacher = subject teacher, else class teacher). MARKS_OPEN notifies sheet teachers.
- **Mark sheets**: `MarkSheet` adds `approvalId` (pending probation review); `rows` empty in lists. Writers: subject/class teacher of the section, or proxy with branch management (`onBehalfOfStaffId` = sheet teacher); parents 404. `PUT` saves the given rows; marks on absent rows are dropped; invalid rows → 400 `details.problems[{studentId, problem}]` (NOT_IN_SECTION, DUPLICATE, ABOVE_MAX, NEGATIVE, TOO_MANY_DECIMALS — max 2 decimals). `PUT`/submit need exam MARKS_OPEN and sheet NOT_ENTERED/DRAFT/RETURNED (409). Submit with a pending row (`marks: null`, not absent) → 400 `details.studentIds`. Accept/return need branch management scope; return only while MARKS_OPEN. A rejected probation submission makes the sheet RETURNED. Completeness rows `{ sheetId, classId, className, sectionId, sectionName, subjectId, subjectName, status, entered, total }`.
- **Compute / approve / publish**: compute needs MARKS_OPEN/MARKS_CLOSED, an APPROVED scheme and every sheet ACCEPTED (409 `{ sheets: [...] }`) before queuing; absent = 0 marks and fails the subject; overall pass = every subject passed and percent ≥ scheme pass %; positions per section (standard 1,2,2,4; null when `exams.positionsEnabled` is false). approve-results also requires results computed after the last sheet decision, sets MARKS_CLOSED and creates `RESULT_PUBLISH` (principal; super admin for a principal's own request); a pending one → 409. Publish renders a report card version per result and notifies guardians; returns `ExamDto`.
- **Result reads**: `GET /results` requires `examId`, plain array, `StudentResult` adds `classId, sectionId`; parents only own children of PUBLISHED exams (others 404). `GET /students/:id/results` → `{ studentId, name, results: [...StudentResult, examName, examType, publishedAt], trend: [{examId, examName, date, percent}] }`. `GET /students/:id/report-cards` → `{ examId, status, fileUrl, generatedAt, version }` (`examId` optional, default latest published; rendered on first request when missing).
- **Progress / homework (§A3)**: `POST /students/:id/progress-notes` → 201 `{ status: "APPLIED"|"PENDING_REVIEW", approvalId, note }`; `GET` plain array (max 200; parents only `visibleToParent`). `PUT /diary/:id/homework-status` needs a PUBLISHED entry with homework (409), returns `{ diaryEntryId, entries: [{studentId, name, rollNo, status|null}] }`. Completion defaults to the last 30 days (max 366) → `{ studentId, from, to, entries[], summary: {total, done, partial, notDone, unmarked} }`.
- **Promotions (§A4)**: suggest needs exams of the branch/session that are RESULTS_APPROVED/PUBLISHED; never overwrites overridden, pending, CONFIRMED or APPLIED rows. `GET /promotions` requires `branchId` + `fromSessionId` (plain array, adds `overridden`). Confirm (`exams.approve` + branch management) creates one `PROMOTION` approval (entityType `PromotionBatch`) → `{ approvalId, count }`. Apply → `{ applied, skipped[] }`; unresolved target sections → 409 `details.decisions` before applying; CONDITIONAL is applied as a promotion; new enrollments get the next free roll number (capacity not checked).
- **Fee heads (§B1)**: missing `schoolId` defaults to the caller's only school (else 400); codes upper-cased, duplicates 409; `ACTIVITY` and `STORE` are reserved system heads (used for activity fees and store sales; listed but refused in plans, 400).
- **Fee plans**: `FeePlan = { id, branchId, sessionId, classId, className, name, status, revision, items[{id, feeHead{id,name}, amountMinor, frequency, dueDay}], lateFee, approved: {revision, approvedAt, approvedBy}|null, createdById, updatedById, createdAt, updatedAt }`; `GET` is a plain array (max 500); a fee head once per plan. PATCH makes the plan DRAFT with `revision+1` while generation keeps using the last **approved** version (snapshot); approve needs DRAFT (409) and is refused to the creator/last editor (403).
- **Invoices (§B2)**: `Invoice` adds `branchId, source (GENERATED|ADHOC|SALE), subtotalMinor, cancelApprovalId, cancelReason`; `period`, `student.className/sectionName` nullable; `payments[].amountMinor` is the part allocated to this invoice (reversed allocations excluded). `POST /invoices/generate` returns **200** `{ jobId }` (result `{ count, skipped }`); period must fall inside the session (400); concessions apply to plan lines only (head-specific first, total ≤ subtotal); activity fees (Phase 3 activities with `feeMinor` whose start is in the period, for participants or students with GRANTED consent, never billed twice) become `"Activity: <title>"` lines; idempotent per student+period (DB partial unique). Invoice numbers are assigned on creation (drafts included). Charges reach the ledger only when issued. `POST /invoices/issue` → `{ issued, issuedIds, failed: [{id, reason}] }` (each invoice separately; advance credit is spent on issue). Cancel returns the Invoice: DRAFT at once; ISSUED/OVERDUE with nothing paid → new approval type `INVOICE_CANCEL` (principal; super admin when a principal asks), approved → `CANCELLATION` ledger entry; paid/partly paid → 409 (reverse payments first). `GET /invoices/:id/pdf` → `{ jobId, status, fileUrl }` (re-rendered when the invoice changed). Parents see only their children's non-DRAFT invoices (others 404).
- **Late fee / overdue**: daily job `fees.markOverdue` (00:15) marks open invoices past due OVERDUE and adds the plan's late fee **once** to the overdue invoice itself (+`LATE_FEE` ledger entry) when today > dueDate + afterDays and a balance remains.
- **Concessions (§B4)**: staff only; PERCENT `value` is a whole percent 1–100, FIXED is minor units per invoice; overlapping PENDING/APPROVED concession for the same student+head → 409. Approval `amountMinor` = estimate on one month of the student's approved plan (MONTHLY items), amount-limited `CONCESSION` steps; RETURNED counts as REJECTED. Approved concessions affect only invoices generated later. `Concession = { id, branchId, student, feeHead|null, type, value, from, to, reason, estimateMinor, status, approvalId, requestedBy, decidedAt, createdAt }`.
- **Ledger / summary**: `GET /students/:id/ledger` → `{ studentId, entries: [{ id, date, createdAt, type, description, refType, refId, amountMinor, balanceMinor, invoiceId, invoiceNo, paymentId, receiptNo, reason }], balanceMinor, currency }` oldest first (positive = owed). `GET /students/:id/fee-summary` adds `currency, balanceMinor, onlineGatewayEnabled, proofUploadEnabled`; `lastPayment` adds `paymentId`.
- **Dues (§B5)**: staff only; rows `{ student, branchId, balanceMinor, overdueMinor, oldestOverdueDays, openInvoices, aging{d0_30,d31_60,d61_90,d90plus}, guardian|null, currency }` sorted by oldest overdue; not-yet-due balances fall in 0–30. `POST /dues/reminders` → 200 `{ jobId }` (needs management scope over each student's branch).
- **Payments (§B3)**: `POST /payments` (201) → `Payment = { id, receiptNo, student{id,name,admissionNo}, amountMinor, unallocatedMinor, method, reference, receivedOn, receivedBy{id,name}, status, reversalReason, reversedAt, gateway, proofId, allocations{invoiceId,invoiceNo,amountMinor,reversed}[], currency, createdAt }`. `unallocatedMinor` is the advance credit, spent automatically (oldest due first) when later invoices are issued. `receivedOn` in the future → 400; CASH on a closed day → 423 `DAY_CLOSED`; invalid explicit allocations → 400; an explicit empty `allocations` list keeps everything as advance. The branch comes from the student's latest enrollment (withdrawn students can still pay). A receipt PDF is rendered and guardians are notified afterwards. `GET /payments` is paged, also takes `studentId`; `cashierId` is the cashier's **user** id (`receivedBy`); parents see only their own children (404 otherwise). Added `GET /payments/:id`. `GET /payments/:id/receipt` → `{ jobId, status, fileUrl }` (re-rendered with a REVERSED watermark after reversal; footer from `fees.receiptFooter`).
- **Reversal**: `POST /payments/:id/reverse` (200) → Payment in `REVERSAL_PENDING` (409 unless RECORDED or when refunds exist). Approval step PRINCIPAL (SUPER_ADMIN when a principal asks). On approval the allocations are released (invoices reopen), a `REVERSAL` ledger entry of +amount references the original `PAYMENT` entry (`reversesId`) with the reason, and other advance credit is re-applied. Rejection/return → RECORDED. The original entry is never changed.
- **Proofs**: `POST /payment-proofs` is parents only (other family's invoice 404, invoice not open 409, `fees.proofUpload` false 403, amount above balance 400, one SUBMITTED proof per invoice 409, file purpose DOCUMENT/ATTACHMENT). `GET /payment-proofs?branchId=&studentId=&status=` is paged; parents see their own children's proofs (incl. `rejectReason`), 404 for other children. `Proof = { id, invoiceId, invoiceNo, student, amountMinor, paidOn, method, reference, fileId, fileUrl, status, submittedBy, decidedBy, decidedAt, note, rejectReason, paymentId, receiptNo, currency, createdAt }`. Verify/reject return 200; the verifier must differ from the submitter. Only verification records a payment (allocated to the proof's invoice up to its balance, rest advance).
- **Refunds (§B4)**: `POST /refunds` (201) → `Refund = { id, paymentId, receiptNo, student, amountMinor, method, reason, status, approvalId, requestedBy, decidedAt, currency, createdAt }`. Only unallocated (advance) money of the payment minus pending refunds is refundable (409 with `details.refundableMinor`; allocated money needs a reversal first). Amount-limited `REFUND` approval; on approval a `REFUND` ledger entry (+amount). If the advance was spent meanwhile, approving fails with 409 (reject the refund). `GET /refunds` (paged, staff) added. Gateway refunds are not called (no real gateway).
- **Online**: `POST /payments/online/initiate` (200, parents) → `{ gateway, redirectUrl }`; `fees.onlineGateway` `"NONE"` (default) or `"MANUAL"` → 409 `GATEWAY_DISABLED`. Callback: gateway key upper-cased, unknown → 404, unverified → 400; idempotent on gateway reference. Only the `PaymentGateway` interface, registry and `ManualGateway` exist.
- **Daily collections (§B5)**: `GET /collections/daily` (date defaults to today) → `{ branchId, date, count, totalMinor, cashMinor, byMethod[], byCashier[], payments, reversedCount, reversedMinor, reversedPayments, closed|null, currency }` (reversed payments excluded from totals). Close returns 200 with the same view; once per day (409); future day 400; `note` required when the difference ≠ 0.
- **Finance dashboard (§G)**: without `branchId` sums all managed branches; `month` defaults to the current month; adds `branchId, month, currency`; `collectionRate` = collected / billed rounded to 2 decimals (0.87 = 87 %); `collectedMinor` is gross; parents 403.
- **Salary structure (§C)**: `GET /staff/:id/salary-structure` returns `{ current: Structure|null, history: Structure[] }` (newest first; current = latest `effectiveFrom` ≤ current month, ties by createdAt). Structure = `{ id, staffId, effectiveFrom, basicMinor, allowances, deductions, allowancesMinor, deductionsMinor, grossMinor, reason, createdBy:{id,name}|null, createdAt }`. PUT takes optional `reason`, appends a row (history is never edited), returns the same shape (200); one's own structure → 403.
- **Adjustments**: `GET /payroll/adjustments` is paged and also accepts `branchId`; rows include `staff {id,name}` and `signedMinor` (BONUS/ARREAR +, DEDUCTION/ADVANCE −). POST → 409 when the month's run is APPROVED or later; own salary → 403. No cancel endpoint yet.
- **Runs**: `PayrollRun = { id, branch{id,name}, month, status, currency, calculatedAt/By, reviewedAt/By, approvedAt/By, closedAt, approval: {id,status}|null, totals {netMinor, paidMinor, balanceMinor}, lines, version, createdAt }`; `PayrollLine` adds `id, employeeNo, workingDays, route ('BRANCH'|'SUPER_ADMIN'), approvalId`. `GET /payroll/runs` is paged. Calculation includes ACTIVE staff with a structure in force (no mid-month pro-rating); unpaid half-days per working day: approved UNPAID leave 2, approved paid leave 0, else ABSENT 2 / HALF_DAY 1; deduction = basic × halfDays / (2 × working days), half-up; net clamped at 0. Recalculation allowed from DRAFT/CALCULATED/REVIEWED (clears the review).
- **Approve**: the caller may not be the run's calculator or reviewer (403). Lines of the caller's own salary, and the principal's line when the caller is not SUPER_ADMIN, go to a separate PAYROLL approval (entityType `PayrollLines`, role SUPER_ADMIN); the run becomes APPROVED when all its approvals are approved; a rejection returns it to REVIEWED and cancels the other pending approval. Empty run → 409. Zero-net lines are PAID on approval. Payslip PDFs are rendered after approval.
- **Payments**: `method` CASH|BANK|CHEQUE|ONLINE; `paidOn` not in the future; above line balance → 409; response (201) is the updated run.
- **Payslips**: `month` optional (latest approved month); only runs APPROVED or later (404 otherwise); response adds `currency, grossMinor, workingDays` and `signedMinor` per adjustment; `pdf` is requested on first read when missing (status PENDING). Reads of another staff member's payslip are audited (`payroll.payslip_read`). Payslip files are owned by the staff member and downloadable only by them or holders of `payroll.view`.
- **Vendors / categories (§D)**: `GET /vendors` is paged (`search, status, schoolId, branchId`); `POST` takes optional `schoolId` (else from `branchId` or the caller's only school; super admin without either → 400); names unique per school (409); GET accepts `expenses.view|inventory.view`, POST `expenses.add|inventory.add`. `POST /expense-categories` takes `{ schoolId, name, code? }` in the body (code derived from the name, upper snake case; duplicate → 409); `GET` returns a plain array `{ id, schoolId, code, name, status }`.
- **Expenses**: added `GET/PATCH /expenses/:id` (PATCH only DRAFT/REJECTED → DRAFT, else 409). List is paged, managed branches, also `vendorId`; `from/to` filter `billDate`. Submit allowed from DRAFT/REJECTED (`expenses.add|submit`, 200) → `EXPENSE` approval with amount-limited steps. Payments only APPROVED/PARTIALLY_PAID (409), above remaining → 409 `details.remainingMinor`. `billFileId` purpose DOCUMENT/ATTACHMENT; `dueDate` < `billDate` → 400. Expense = `{ id, branchId, category:{id,code,name}, vendor:{id,name}|null, title, amountMinor, paidMinor, balanceMinor, currency, billDate, dueDate, billFileId, billUrl, recurring:{monthly,untilMonth}|null, recurringPeriod, recurringParentId, purchaseOrderId, notes, status, approvalId, payments[], createdAt }`. `expenses.recurring` (1st of month 00:30) creates DRAFT copies (same day clamped to month end) and notifies the template's creator; RETURNED approval → DRAFT.
- **Inventory**: `GET /inventory/items` paged with `search`; `stock/lowStock` only with `branchId` (`lowStock=true` without it → 400); saleable items need `salePriceMinor`; SKU unique per school. `GET /inventory/stock` lists all active items (0 when no movements). Added `GET /inventory/movements?branchId=&itemId=&studentId=&from=&to=` (paged, newest first, `item`, `performedBy`). `POST /inventory/movements`: `quantity` positive (ADJUST may be negative, non-zero, reason required); optional `studentId` (issue to / return from a student, used by certificate clearance); direct `TRANSFER_IN` → 400 (created by `TRANSFER_OUT` with `toBranchId` in the same school, linked by `refType "StockTransfer"`); negative stock → 409 `NEGATIVE_STOCK` `details {available, requested}`; response adds `balanceAfter`. `inventory.lowStock` daily 07:00 notifies accountants + principal (items with reorderLevel > 0).
- **Assets**: `POST /assets` takes `branchId` in the body (`inventory.edit|add`); item must be `isAsset` (400); tag unique per school; DISPOSED is final (409). `GET /assets` paged with `branchId, itemId, condition, search`.
- **Purchasing**: purchase requests get `requestNo` `PR-{BRANCH}-{YEAR}-{SEQ}`; added `GET /purchase-requests/:id`; responses include `purchaseOrder: { id, poNo, vendor, lines: [{itemId,itemName,orderedQty,receivedQty,unitPriceMinor}], status } | null`. Order only APPROVED (409); order lines must be items of the request. Added `GET /purchase-orders` and `GET /purchase-orders/:id` (`lines` with ordered/received/remaining, `receipts`, `expenseId`). Receive (200) only ORDERED/PARTIALLY_RECEIVED; above remaining → 409. Bill (201, returns the Expense): once (409), nothing received → 409; amount = Σ received × unit price; category SUPPLIES; created SUBMITTED with an `EXPENSE` approval; PO → BILLED (no more receipts).
- **Sales**: `POST /inventory/sales` (201) uses the student's active (else latest) enrollment, needs branch management scope; items saleable + priced; issues the SALE invoice (STORE fee head, due today) in the same transaction; ISSUE movements carry `studentId`, `refType "Sale"`, `refId` invoice id. Response `{ invoiceId, invoiceNo, totalMinor, movements }`.
- **Certificates (§F)**: every endpoint returns `Certificate = { id, branchId, serialNo, type, status, student: { id, name, admissionNo, className, sectionName }, purpose, details, requestedBy: {id,name}, requestedAt, approvedBy: {id,name}|null, issuedAt (YYYY-MM-DD)|null, effectiveDate|null, isDuplicate, duplicateOfId, reissueReason, rejectionReason, fileUrl }`; issue and reissue add `jobId`. Added `GET /certificates/:id` (same scope as the list; parents 404 outside own children); on an ISSUED certificate without a ready PDF it starts rendering (`fileUrl` null until READY). Create 201; approve/reject/issue/reissue 200. Staff need management scope over the student's branch (latest enrollment); one open (REQUESTED/APPROVED) certificate per student+type (409); ACHIEVEMENT needs `details.activityId` or `details.achievement` (400). Requester cannot decide their own request (403); reject takes `{ reason }`. Clearance (SCHOOL_LEAVING/TRANSFER, on approve and again on issue): ledger balance > 0 or any open invoice balance, or non-saleable items issued to the student (stock movements with `studentId`) not fully returned → 409 `CLEARANCE_REQUIRED` `details: { outstandingMinor, items: [{ itemId, name, quantity }] }`. Issue takes optional `{ effectiveDate }` (SCHOOL_LEAVING, default today) and withdraws the student in the same transaction (409 if already left or a transfer is open). Serial `CERT-{TYPE}-{YEAR}-{SEQ:4}` per school/type/year. Reissue `{ reason }` on ISSUED originals creates a new ISSUED row with the same serial, `isDuplicate: true`, "DUPLICATE" PDF. Verify is public and throttled; unknown serials return 200 `{ valid: false, type: null, studentName: null, issuedOn: null }`; only originals validate.
- **Reports (§G)**: catalog items `{ key, title, description, formats, params: [{ name, type: 'uuid'|'month'|'date'|'int', required }] }`; only roles with branch/school management scope get reports (teachers/parents: empty list); `branch.comparison` SUPER_ADMIN only. Params: attendance.monthly / attendance.staff / payroll.summary `{ branchId, month }`; syllabus.coverage `{ branchId, sessionId? }`; results.analysis `{ examId }`; fees.collection / expenses.summary `{ branchId, from, to }` (≤ 366 days); fees.aging / inventory.stock `{ branchId }`; fees.defaulters `{ branchId, minDays? }` (default 1); branch.comparison `{ schoolId, month }`. `POST /reports` → 201 `{ jobId }`, validated (400) and permission/scope-checked (403) before queueing. `GET /reports/:jobId` → `{ status: 'QUEUED'|'RUNNING'|'DONE'|'FAILED', fileUrl, count?, error? }`, owner only (404); report files are downloadable only by the requester. CSV UTF-8 with BOM + CRLF, money in major units with 2 decimals; XLSX money cells `#,##0.00`; PDF landscape table.
- **Seed (§J)**: grading scheme "Standard 2026-27" (A+ 90–100 … E 33–49, F 0–32, pass 33 %); "Mid-term 2026" (Class 4–5) PUBLISHED with marks/results (report card PDFs render on first request); "Final 2027" MARKS_OPEN with 5-A Mathematics DRAFT (one pending row) and 5-B English SUBMITTED. Fee heads TUITION, ADMISSION, EXAM, TRANSPORT, COMPLAB; approved plans for Classes 1–5; invoices for the last 3 months for 4-A/4-B/5-A/5-B (PAID, PARTIALLY_PAID, ISSUED, OVERDUE with late fees); parent@'s Ayesha has last month's invoice open with a SUBMITTED bank proof; one PENDING concession (25 % tuition, 5-B); yesterday's collection closed. Salary structures for all branch staff; last month's run PAID, current month CALCULATED. Vendors City Properties, LESCO, Al-Noor Stationers; expenses: rent (recurring, PAID), electricity PAID, repairs SUBMITTED. Items: chairs (assets CH-001..003), notebooks and uniform shirts (saleable), markers (low stock); PO-MAIN-YYYY-0001 partially received (120/200). Certificates: CHARACTER ISSUED (`CERT-CHARACTER-YYYY-0001`), SCHOOL_LEAVING REQUESTED for a 4-A student with dues (approval → 409 CLEARANCE_REQUIRED).
- **Not implemented yet**: real online gateways (only the `ManualGateway`; online payment stays disabled), gateway refunds, fee plan archiving, cancelling payroll adjustments, mid-month salary pro-rating for joiners/leavers, promotion section capacity checks.
- **Fee printing (challans, receipts, fee-received alert)**:
  - **Bank challan** (`GET /invoices/:id/pdf` and bulk print): one A4 landscape page per invoice with three tear-off copies — Bank / School / Parent. Each copy: school logo (PNG/JPEG `SCHOOL_LOGO`) + name, branch line, bank box from `fees.bankAccount` ("Pay at: School fee counter" when no bank/account no is set), challan no (= invoice no), fee month, issue/due dates (`DD-Mon-YYYY`), student, father/guardian (FATHER link, else primary guardian), admission no, class-section, fee-head rows (same head merged, > 10 heads fold into "Other fees"), arrears (balances of the student's older open invoices, labelled with their months), concession, late fee already charged, already paid, **Payable by <due date>** = balance + arrears, **Payable after <due date + afterDays>** = that + the invoice's late-fee rule amount (only while open with a rule and no late fee yet), amount in words (lakh/crore, "Rupees … Only"), "For bank use" box, `fees.challanNote`, QR `ESCHOOL:CHALLAN:<invoiceNo>:<payableMinor>`, depositor / bank stamp lines; DRAFT/PAID/CANCELLED watermark. The PDF is re-rendered when the invoice, any other invoice of the student, or the branch bank details/note changed after the last version.
  - **Bulk print** `POST /invoices/challans/print` (`fees.view`, staff who can read the branch): invoices of `period` in ISSUED / PARTIALLY_PAID / OVERDUE, optionally one class or section (section must be in the branch and of `classId`, else 404/400); none → 400. Runs on the `documents` queue as `fees.printChallans`; poll `GET /jobs/:jobId` (`progress` 0–100, result `{ count, fileUrl }`). Pages ordered by class level, section, student name; file `challans-<BRANCH>-<YYYY-MM>[-<class-section>].pdf` (file purpose `CHALLAN`).
  - **Receipts** `GET /payments/:id/receipt?format=`: `a4` (default) = A4 portrait with School copy and Student copy (receipt no, date, student, admission no, class, method/reference, invoices paid with month, advance credit, refunds, amount received, amount in words, balance due or advance credit left, cashier, signature line, `fees.receiptFooter`); `thermal` = 80 mm (226.77 pt) wide single-column Courier slip, page height fits the content (new document kind `RECEIPT_THERMAL`, migration `20261009160000_receipt_thermal_kind`). Both carry a REVERSED mark after a reversal.
  - **Fee-received alert**: every recorded payment (counter, verified proof, online) notifies the student's guardians, category `FEE`, title "Fee payment received", body "<amount> received for <student>. Receipt <no>. Remaining balance <ledger balance>." (or "No dues left." / advance credit), channels in-app + PUSH + SMS (subject to the school's notification switches and the recipient having a device/phone).
