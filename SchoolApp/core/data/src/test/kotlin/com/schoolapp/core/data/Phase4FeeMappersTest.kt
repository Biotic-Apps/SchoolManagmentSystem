package com.schoolapp.core.data

import com.schoolapp.core.data.fees.toModel
import com.schoolapp.core.model.fees.DuesAging
import com.schoolapp.core.model.fees.InvoiceStatus
import com.schoolapp.core.model.fees.PaymentMethod
import com.schoolapp.core.model.fees.ProofMethod
import com.schoolapp.core.model.fees.ProofStatus
import com.schoolapp.core.network.NetworkJson
import com.schoolapp.core.network.dto.common.IdNameDto
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
    fun dues_row_without_student_id_is_dropped_and_aging_keys_are_read() {
        assertNull(DuesRowDto(name = "Nobody", balanceMinor = 100).toModel())
        val row = NetworkJson.decodeFromString(
            DuesRowDto.serializer(),
            """{"student":{"id":"s1","name":"Ali"},"balanceMinor":1200000,"days":75,
               "aging":{"0-30":200000,"31-60":300000,"61-90":700000,"90+":0}}""",
        ).toModel()
        assertEquals("s1", row?.studentId)
        assertEquals("Ali", row?.studentName)
        assertEquals(75, row?.oldestDueDays)
        assertEquals(DuesAging(200_000, 300_000, 700_000, 0), row?.aging)
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
