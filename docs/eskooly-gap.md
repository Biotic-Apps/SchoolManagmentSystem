# eSkooly comparison and build list (2026-10-09)

Research from public eSkooly pages (eskooly.com feature pages, pricing, changelog) and review-site summaries. The eSkooly dashboard itself was not visible (needs a login).

## Where eSchool is already ahead
Approvals + audit history, strict RBAC/2FA/backups, append-only fee ledger with refunds/reversals/proof checks,
per-student fee overrides, offline Android (attendance, diary, marks, cash), health, pickup, meetings, complaints,
admissions pipeline, certificate QR verification, data import, fee reminders that include the amount.

## Build list
**P0 (pilot):**
1. Bank challan, 3 copies (bank / school / parent), with bank details and the amount payable after the due date
2. Bulk print by class/section: challans, result cards, ID cards
3. Family-wise fees: combined challan and automatic sibling discount
4. Behaviour & skills ratings on the result card
5. Admission letter PDF with parent login details
6. Receipts: 80 mm thermal and A4 with two copies
7. Low-cost SMS via the school's own Android phone as a gateway
8. Printable date sheet and blank award list

**P1:**
9. WhatsApp alerts
10. QR card-scan attendance
11. Staff ID cards
12. HR letters
13. Simple accounts: other income and profit & loss
14. Urdu / RTL interface
15. Report-card templates
16. JazzCash / Easypaisa payments
17. Public online admission form
18. Student role

**P2:**
19. Question bank and paper generator
20. Custom fields
21. Custom report columns
22. Homework submission
23. Parent store and POS
24. Biometric import
25. School website
26. Bulk / custom certificates

## Status
- Done 2026-10-09 (commit 405f7f2): P0 #1, #2, #4, #5 (login slip), #6, #8, plus the fee-received alert and parent password login by admission number.
- Next: P0 #3 (family-wise fees), #7 (SMS gateway on the school's phone), then P1.
