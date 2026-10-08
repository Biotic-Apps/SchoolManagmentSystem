package com.schoolapp.core.data

import com.schoolapp.core.data.fees.toModel
import com.schoolapp.core.model.fees.DuesAging
import com.schoolapp.core.model.fees.DuesGuardian
import com.schoolapp.core.model.fees.InvoiceStatus
import com.schoolapp.core.model.fees.PaymentMethod
import com.schoolapp.core.model.fees.ProofMethod
import com.schoolapp.core.model.fees.ProofStatus
import com.schoolapp.core.network.NetworkJson
import com.schoolapp.core.network.dto.common.IdNameDto
import com.schoolapp.core.network.dto.fees.DailyCollectionDto
import com.schoolapp.core.network.dto.fees.DuesRowDto
import com.schoolapp.core.network.dto.fees.FeeSummaryDto
import com.schoolapp.core.network.dto.fees.FinanceDashboardDto
import com.schoolapp.core.network.dto.fees.InvoiceDto
import com.schoolapp.core.network.dto.fees.InvoicePaymentDto
import com.schoolapp.core.network.dto.fees.PaymentDto
import com.schoolapp.core.network.dto.fees.PaymentProofDto
import com.schoolapp.core.network.dto.files.AttachmentDto
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class Phase4FeeMappersTest {

    @Test
    fun invoice_maps_lines_defaults_currency_and_sorts_payments_newest_first() {
        val dto = NetworkJson.decodeFromString(
            InvoiceDto.serializer(),
            """{"id":"inv1","invoiceNo":"INV-MAIN-202610-0001",
               "student":{"id":"s1","name":"Ayesha Khan","admissionNo":"BS-2026-0010","className":"Class 5","sectionName":"A"},
               "period":"2026-10","issueDate":"2026-10-01","dueDate":"2026-10-10","status":"PARTIALLY_PAID",
               "lines":[{"id":"l1","feeHead":{"id":"fh1","name":"Tuition"},"description":"  ","amountMinor":850000},
                        {"id":"l2","feeHead":{"id":"fh2","name":"Computer Lab"},"description":"October","amountMinor":120000}],
               "concessionMinor":85000,"lateFeeMinor":0,"totalMinor":885000,"paidMinor":400000,"balanceMinor":485000,
               "payments":[{"paymentId":"p1","receiptNo":"RCT-MAIN-2026-0001","amountMinor":200000,"paidOn":"2026-10-02"},
                           {"paymentId":"p2","receiptNo":"RCT-MAIN-2026-0007","amountMinor":200000,"paidOn":"2026-10-05"}]}""",
        )
        val invoice = dto.toModel()
        assertEquals("PKR", invoice.currency)
        assertEquals(InvoiceStatus.PARTIALLY_PAID, invoice.status)
        assertEquals("s1", invoice.studentId)
        assertEquals("Ayesha Khan", invoice.studentName)
        assertEquals(listOf("Tuition", "Computer Lab"), invoice.lines.map { it.feeHeadName })
        assertNull(invoice.lines[0].description)
        assertEquals("October", invoice.lines[1].description)
        assertEquals(listOf("p2", "p1"), invoice.payments.map { it.paymentId })
        assertEquals(485_000L, invoice.balanceMinor)
        assertTrue(invoice.isPayable)
    }

    @Test
    fun invoice_payable_only_with_balance_and_not_cancelled_or_draft() {
        val base = InvoiceDto(id = "i", currency = "USD", status = "PAID", balanceMinor = 0)
        assertEquals("USD", base.toModel().currency)
        assertFalse(base.toModel().isPayable)
        assertFalse(base.copy(status = "CANCELLED", balanceMinor = 100).toModel().isPayable)
        assertFalse(base.copy(status = "DRAFT", balanceMinor = 100).toModel().isPayable)
        assertTrue(base.copy(status = "OVERDUE", balanceMinor = 100).toModel().isPayable)
        assertEquals(InvoiceStatus.ISSUED, base.copy(status = "SOMETHING_NEW").toModel().status)
        val sorted = base.copy(payments = listOf(InvoicePaymentDto("a", paidOn = null), InvoicePaymentDto("b", paidOn = "2026-09-01"))).toModel()
        assertEquals(listOf("b", "a"), sorted.payments.map { it.paymentId })
    }

    @Test
    fun payment_maps_student_from_either_field_and_method_fallback() {
        val payment = PaymentDto(
            id = "p1",
            receiptNo = "RCT-MAIN-2026-0001",
            student = IdNameDto("s1", "Ali"),
            amountMinor = 500_000,
            method = "BANK",
            reference = " ",
            receivedOn = "2026-10-06",
            cashier = IdNameDto("u1", "Cashier One"),
            status = "RECORDED",
        ).toModel()
        assertEquals("s1", payment.studentId)
        assertEquals("Ali", payment.studentName)
        assertEquals(PaymentMethod.BANK, payment.method)
        assertNull(payment.reference)
        assertEquals("Cashier One", payment.cashierName)

        val other = PaymentDto(id = "p2", studentId = "s9", method = "CRYPTO").toModel()
        assertEquals("s9", other.studentId)
        assertEquals(PaymentMethod.CASH, other.method)
    }

    @Test
    fun proof_uses_file_url_then_flat_url_and_invoice_reference_fallbacks() {
        val nested = PaymentProofDto(
            id = "pr1",
            invoice = com.schoolapp.core.network.dto.fees.InvoiceRefDto("inv1", "INV-MAIN-202610-0001"),
            student = IdNameDto("s1", "Ayesha Khan"),
            amountMinor = 850_000,
            method = "WALLET",
            reference = "EP-778899",
            file = AttachmentDto(id = "f1", url = "https://files/f1", mime = "image/jpeg"),
            fileUrl = "https://files/flat",
            status = "SUBMITTED",
            submittedBy = IdNameDto("g1", "Imran Khan"),
        ).toModel()
        assertEquals("inv1", nested.invoiceId)
        assertEquals("INV-MAIN-202610-0001", nested.invoiceNo)
        assertEquals("https://files/f1", nested.fileUrl)
        assertEquals("image/jpeg", nested.fileMime)
        assertEquals(ProofMethod.WALLET, nested.method)
        assertEquals(ProofStatus.SUBMITTED, nested.status)
        assertEquals("Imran Khan", nested.submittedBy)

        val flat = PaymentProofDto(id = "pr2", invoiceId = "inv2", fileUrl = "https://files/flat", method = "CARD", status = "REJECTED", reason = "Blurry").toModel()
        assertEquals("inv2", flat.invoiceId)
        assertEquals("https://files/flat", flat.fileUrl)
        assertEquals(ProofMethod.OTHER, flat.method)
        assertEquals(ProofStatus.REJECTED, flat.status)
        assertEquals("Blurry", flat.reason)
    }

    @Test
    fun fee_summary_flags_follow_branch_settings_with_defaults() {
        val defaults = FeeSummaryDto(totalDueMinor = 100).toModel()
        assertTrue(defaults.proofUploadEnabled)
        assertFalse(defaults.onlineGatewayEnabled)
        assertEquals("PKR", defaults.currency)

        assertFalse(FeeSummaryDto(proofUpload = false).toModel().proofUploadEnabled)
        assertFalse(FeeSummaryDto(onlineGateway = "NONE").toModel().onlineGatewayEnabled)
        assertTrue(FeeSummaryDto(onlineGateway = "JAZZCASH").toModel().onlineGatewayEnabled)
    }

    @Test
    fun dues_row_without_student_id_is_dropped() {
        assertNull(DuesRowDto(name = "Nobody", balanceMinor = 100).toModel())
    }

    @Test
    fun dues_row_reads_live_api_shape_with_nested_student_aging_and_guardian() {
        // Captured from GET /dues (accountant, demo school).
        val row = NetworkJson.decodeFromString(
            DuesRowDto.serializer(),
            """{"student":{"id":"01a1100a-a9f3-7188-83ba-cbb130bceb70","name":"Hamza Butt","admissionNo":"BRIGHT-2026-0022",
               "className":"Class 5","sectionName":"A"},"branchId":"01a1100a-9fc0-755c-b84b-abbfa92b7671","balanceMinor":1640000,
               "overdueMinor":940000,"oldestOverdueDays":59,"openInvoices":3,
               "aging":{"d0_30":1320000,"d31_60":320000,"d61_90":0,"d90plus":0},
               "guardian":{"name":"Mr. Butt","phone":"+923002000022","relation":"FATHER"},"currency":"PKR"}""",
        ).toModel()!!
        assertEquals("01a1100a-a9f3-7188-83ba-cbb130bceb70", row.studentId)
        assertEquals("Hamza Butt", row.studentName)
        assertEquals("BRIGHT-2026-0022", row.admissionNo)
        assertEquals("Class 5", row.className)
        assertEquals("A", row.sectionName)
        assertEquals(59, row.oldestDueDays)
        assertEquals(940_000L, row.overdueMinor)
        assertEquals(DuesAging(1_320_000, 320_000, 0, 0), row.aging)
        assertEquals(DuesGuardian("Mr. Butt", "+923002000022", "FATHER"), row.guardian)
    }

    @Test
    fun proof_reads_live_reject_reason_note_and_student_id() {
        // Shape captured from GET /payment-proofs; status/rejectReason/note set as the API sends them after a rejection.
        val proof = NetworkJson.decodeFromString(
            PaymentProofDto.serializer(),
            """{"id":"01a110a4-949e-77ca-ad47-67b7a91278bb","invoiceId":"01a110a4-9278-738e-a58d-e4008a9b4b74",
               "invoiceNo":"INV-MAIN-202609-0021","student":{"id":"01a1100a-a9ea-77da-9b0f-96476f2ae70f","name":"Ayesha Javed",
               "admissionNo":"BRIGHT-2026-0021"},"amountMinor":620000,"paidOn":"2026-10-05","method":"BANK",
               "reference":"MCB-TRX-552901","fileId":"01a110a4-9499-709c-b59b-ca3983caf78f","fileUrl":"http://localhost:3000/api/v1/files/x/content",
               "status":"REJECTED","submittedBy":{"id":"p1","name":"Demo Parent"},"decidedBy":{"id":"a1","name":"Demo Accountant"},
               "decidedAt":"2026-10-07T10:00:00.000Z","note":null,"rejectReason":"Amount does not match the bank slip",
               "paymentId":null,"receiptNo":null,"currency":"PKR","createdAt":"2026-10-06T09:56:23.838Z"}""",
        ).toModel()
        assertEquals(ProofStatus.REJECTED, proof.status)
        assertEquals("Amount does not match the bank slip", proof.reason)
        assertEquals("01a1100a-a9ea-77da-9b0f-96476f2ae70f", proof.studentId)
        assertNull(proof.note)
    }

    @Test
    fun payment_reads_received_by_from_live_api() {
        // Captured from GET /payments (accountant).
        val payment = NetworkJson.decodeFromString(
            PaymentDto.serializer(),
            """{"id":"01a110a7-7823-77ab-bcfb-69ef6cb8937e","receiptNo":"RCT-MAIN-2026-0097","student":{"id":"01a1100a-a9ea-77da-9b0f-96476f2ae70f",
               "name":"Ayesha Javed","admissionNo":"BRIGHT-2026-0021"},"amountMinor":100000,"unallocatedMinor":0,"method":"CASH",
               "reference":null,"receivedOn":"2026-10-06","receivedBy":{"id":"u1","name":"Demo Accountant"},"status":"RECORDED",
               "reversalReason":null,"reversedAt":null,"gateway":null,"proofId":null,"allocations":[],"currency":"PKR",
               "createdAt":"2026-10-06T09:59:33.155Z"}""",
        ).toModel()
        assertEquals("Demo Accountant", payment.cashierName)
        assertTrue(payment.isActive)
        assertFalse(payment.copy(status = "REVERSED").isActive)
        assertFalse(payment.copy(status = "REVERSAL_PENDING").isActive)
    }

    @Test
    fun daily_collection_open_day_has_null_closing_and_closed_day_maps_cash_count() {
        // Open day captured from GET /collections/daily.
        val open = NetworkJson.decodeFromString(
            DailyCollectionDto.serializer(),
            """{"branchId":"b1","date":"2026-10-08","count":0,"totalMinor":0,"cashMinor":0,"byMethod":[],"byCashier":[],
               "payments":[],"reversedCount":0,"reversedMinor":0,"reversedPayments":[],"closed":null,"currency":"PKR"}""",
        ).toModel("2026-10-08")
        assertFalse(open.closed)
        val closed = NetworkJson.decodeFromString(
            DailyCollectionDto.serializer(),
            """{"branchId":"b1","date":"2026-10-06","count":2,"totalMinor":300000,"cashMinor":200000,
               "byMethod":[{"method":"CASH","count":1,"amountMinor":200000}],
               "byCashier":[{"cashier":{"id":"u1","name":"Demo Accountant"},"count":2,"amountMinor":300000}],"payments":[],
               "closed":{"closedBy":{"id":"u1","name":"Demo Accountant"},"closedAt":"2026-10-06T17:00:00.000Z",
               "cashExpectedMinor":200000,"cashCountedMinor":195000,"differenceMinor":-5000,"note":"Short 50"},"currency":"PKR"}""",
        ).toModel("2026-10-06")
        assertTrue(closed.closed)
        assertEquals(200_000L, closed.cashMinor)
        assertEquals(-5_000L, closed.closing?.differenceMinor)
        assertEquals("Demo Accountant", closed.closing?.closedBy)
        assertEquals("Demo Accountant", closed.byCashier.single().cashierName)
    }

    @Test
    fun finance_dashboard_rate_fraction_becomes_percent() {
        val fraction = FinanceDashboardDto(billedMinor = 1_000, collectedMinor = 800, collectionRate = 0.8, todayCollectedMinor = 50).toModel()
        assertEquals(80.0, fraction.collectionRate, 0.001)
        assertEquals(50L, fraction.todayCollectedMinor)
        val percent = FinanceDashboardDto(billedMinor = 1_000, collectedMinor = 800, collectionRate = 80.0).toModel()
        assertEquals(80.0, percent.collectionRate, 0.001)
    }
}
