package com.schoolapp.demo

import com.schoolapp.core.model.approval.ApprovalRequest
import com.schoolapp.core.model.approval.ApprovalStatus
import com.schoolapp.core.model.approval.ApprovalStep
import java.time.YearMonth

/** Phase 4 (finance & results) approval types awaiting the principal / super admin, with payload summaries. */
internal object DemoPhase4Approvals {
    @Suppress("LongParameterList")
    private fun pending(
        id: String,
        type: String,
        entity: String,
        title: String,
        by: String,
        daysAgo: Int,
        details: List<Pair<String, String>>,
        amountMinor: Long? = null,
    ): ApprovalRequest {
        val day = DemoDates.previousSchoolDays(daysAgo.coerceAtLeast(1)).last()
        return ApprovalRequest(
            id = id,
            type = type,
            entityType = entity,
            title = title,
            requestedById = "demo-u-$id",
            requestedByName = by,
            status = ApprovalStatus.PENDING,
            currentStep = 1,
            createdAt = DemoDates.iso(day, "10:30"),
            steps = listOf(ApprovalStep(1, "PRINCIPAL", null, null, null, null)),
            details = details,
            amountMinor = amountMinor,
        )
    }

    private val month: YearMonth get() = YearMonth.from(DemoDates.today())

    val items: List<ApprovalRequest>
        get() = listOf(
            pending(
                "demo-ap-41", "RESULT_PUBLISH", "Exam", "Final exam results: Class 5", "Sana Iqbal", 1,
                listOf("examName" to "Final exam", "className" to "Class 5", "sheetsAccepted" to "12", "sheetsTotal" to "12"),
            ),
            pending(
                "demo-ap-42", "PROMOTION", "Promotion", "Promotion: Class 5 (2026-27)", "Sana Iqbal", 2,
                listOf("fromSession" to "2026-27", "toSession" to "2027-28", "className" to "Class 5", "promoteCount" to "38", "repeatCount" to "2"),
            ),
            pending(
                "demo-ap-43", "CONCESSION", "Concession", "Concession: Ayesha Khan (25%)", "Usman Raza", 1,
                listOf(
                    "studentName" to "Ayesha Khan", "className" to "Class 5 - A", "type" to "PERCENT", "value" to "25",
                    "amountMinor" to "312500", "reason" to "Sibling discount",
                ),
                amountMinor = 312_500,
            ),
            pending(
                "demo-ap-44", "REFUND", "Payment", "Refund: Omar Khan", "Usman Raza", 2,
                listOf(
                    "studentName" to "Omar Khan", "receiptNo" to "RCPT-MAIN-2026-0131", "amountMinor" to "250000",
                    "method" to "CASH", "reason" to "Transport fee charged twice",
                ),
                amountMinor = 250_000,
            ),
            pending(
                "demo-ap-45", "PAYMENT_REVERSAL", "Payment", "Reversal: receipt RCPT-MAIN-2026-0142", "Usman Raza", 1,
                listOf("receiptNo" to "RCPT-MAIN-2026-0142", "studentName" to "Maryam Raza", "amountMinor" to "1250000", "reason" to "Cheque bounced"),
                amountMinor = 1_250_000,
            ),
            pending(
                "demo-ap-46", "PAYROLL", "PayrollRun", "Payroll: ${month.month.name.lowercase().replaceFirstChar { it.uppercase() }} ${month.year}",
                "Usman Raza", 1,
                listOf("month" to month.toString(), "staffCount" to "6", "netMinor" to DemoPayrollData.currentNetMinor.toString()),
                amountMinor = DemoPayrollData.currentNetMinor,
            ),
            pending(
                "demo-ap-47", "EXPENSE", "Expense", "Generator repair", "Usman Raza", 3,
                listOf(
                    "title" to "Generator repair", "category" to "REPAIRS", "vendor" to "Power Tech Services",
                    "amountMinor" to "4500000", "billDate" to DemoDates.previousSchoolDays(3).last().toString(),
                ),
                amountMinor = 4_500_000,
            ),
            pending(
                "demo-ap-48", "PURCHASE_ORDER", "PurchaseRequest", "Purchase request: classroom furniture", "Usman Raza", 4,
                listOf("lines" to "3", "totalMinor" to "18500000", "reason" to "New section 4-B desks and chairs"),
                amountMinor = 18_500_000,
            ),
            pending(
                "demo-ap-49", "CERTIFICATE", "Certificate", "School leaving certificate: Omar Khan", "Imran Khan", 2,
                listOf("studentName" to "Omar Khan", "className" to "Class 4 - B", "type" to "SCHOOL_LEAVING", "purpose" to "Family relocating to Karachi"),
            ),
        )
}
