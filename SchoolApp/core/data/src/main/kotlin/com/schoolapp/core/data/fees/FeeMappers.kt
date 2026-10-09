package com.schoolapp.core.data.fees

import com.schoolapp.core.model.common.enumOrDefault
import com.schoolapp.core.model.fees.CashierTotal
import com.schoolapp.core.model.fees.DailyCollection
import com.schoolapp.core.model.fees.DayClosing
import com.schoolapp.core.model.fees.DuesAging
import com.schoolapp.core.model.fees.DuesGuardian
import com.schoolapp.core.model.fees.DuesRow
import com.schoolapp.core.model.fees.FeeSummary
import com.schoolapp.core.model.fees.FinanceOverview
import com.schoolapp.core.model.fees.Invoice
import com.schoolapp.core.model.fees.InvoiceLine
import com.schoolapp.core.model.fees.InvoicePayment
import com.schoolapp.core.model.fees.InvoiceStatus
import com.schoolapp.core.model.fees.LastPayment
import com.schoolapp.core.model.fees.MethodTotal
import com.schoolapp.core.model.fees.NextDue
import com.schoolapp.core.model.fees.Payment
import com.schoolapp.core.model.fees.PaymentMethod
import com.schoolapp.core.model.fees.PaymentProof
import com.schoolapp.core.model.fees.ProofMethod
import com.schoolapp.core.model.fees.ProofStatus
import com.schoolapp.core.network.dto.fees.DailyCollectionDto
import com.schoolapp.core.network.dto.fees.DuesRowDto
import com.schoolapp.core.network.dto.fees.FeeSummaryDto
import com.schoolapp.core.network.dto.fees.FinanceDashboardDto
import com.schoolapp.core.network.dto.fees.InvoiceDto
import com.schoolapp.core.network.dto.fees.PaymentDto
import com.schoolapp.core.network.dto.fees.PaymentProofDto

internal const val DEFAULT_CURRENCY = "PKR"
private const val GATEWAY_NONE = "NONE"

internal fun InvoiceDto.toModel() = Invoice(
    id = id,
    invoiceNo = invoiceNo,
    studentId = student?.id,
    studentName = student?.name.orEmpty(),
    admissionNo = student?.admissionNo,
    className = student?.className,
    sectionName = student?.sectionName,
    period = period,
    issueDate = issueDate,
    dueDate = dueDate,
    status = enumOrDefault(status, InvoiceStatus.ISSUED),
    lines = lines.map { InvoiceLine(it.id, it.feeHead?.name.orEmpty(), it.description?.takeIf(String::isNotBlank), it.amountMinor) },
    concessionMinor = concessionMinor,
    lateFeeMinor = lateFeeMinor,
    totalMinor = totalMinor,
    paidMinor = paidMinor,
    balanceMinor = balanceMinor,
    payments = payments.map { InvoicePayment(it.paymentId, it.receiptNo, it.amountMinor, it.paidOn) }
        .sortedByDescending { it.paidOn.orEmpty() },
    currency = currency ?: DEFAULT_CURRENCY,
)

internal fun FeeSummaryDto.toModel() = FeeSummary(
    totalDueMinor = totalDueMinor,
    overdueMinor = overdueMinor,
    advanceMinor = advanceMinor,
    lastPayment = lastPayment?.let { LastPayment(it.amountMinor, it.paidOn, it.receiptNo) },
    nextDue = nextDue?.let { NextDue(it.balanceMinor ?: it.amountMinor ?: 0, it.dueDate, it.invoiceNo, it.invoiceId) },
    currency = currency ?: DEFAULT_CURRENCY,
    proofUploadEnabled = proofUploadEnabled ?: proofUpload ?: true,
    onlineGatewayEnabled = onlineGatewayEnabled ?: (onlineGateway != null && onlineGateway != GATEWAY_NONE),
)

internal fun PaymentProofDto.toModel() = PaymentProof(
    id = id,
    invoiceId = invoiceId ?: invoice?.id,
    invoiceNo = invoiceNo ?: invoice?.invoiceNo,
    studentName = student?.name,
    amountMinor = amountMinor,
    paidOn = paidOn,
    method = enumOrDefault(method, ProofMethod.OTHER),
    reference = reference?.takeIf(String::isNotBlank),
    fileUrl = file?.url ?: fileUrl,
    fileMime = file?.mime,
    status = enumOrDefault(status, ProofStatus.SUBMITTED),
    reason = (rejectReason ?: reason)?.takeIf(String::isNotBlank),
    submittedBy = submittedBy?.name,
    createdAt = createdAt,
    studentId = student?.id,
    note = note?.takeIf(String::isNotBlank),
)

internal fun PaymentDto.toModel() = Payment(
    id = id,
    receiptNo = receiptNo,
    studentId = studentId ?: student?.id,
    studentName = student?.name,
    amountMinor = amountMinor,
    method = enumOrDefault(method, PaymentMethod.CASH),
    reference = reference?.takeIf(String::isNotBlank),
    receivedOn = receivedOn,
    cashierName = (receivedBy ?: cashier)?.name,
    status = status,
    currency = currency ?: DEFAULT_CURRENCY,
)

internal fun DuesRowDto.toModel(): DuesRow? {
    val id = studentId ?: student?.id ?: return null
    return DuesRow(
        studentId = id,
        studentName = student?.name ?: name.orEmpty(),
        admissionNo = student?.admissionNo ?: admissionNo,
        className = student?.className ?: className,
        sectionName = student?.sectionName ?: sectionName,
        balanceMinor = balanceMinor,
        oldestDueDays = oldestOverdueDays ?: oldestDueDays ?: days,
        aging = aging?.let { DuesAging(it.d0to30, it.d31to60, it.d61to90, it.d90plus) },
        overdueMinor = overdueMinor,
        guardian = guardian?.let { g ->
            g.name?.takeIf(String::isNotBlank)?.let { DuesGuardian(it, g.phone?.takeIf(String::isNotBlank), g.relation) }
        },
    )
}

internal fun DailyCollectionDto.toModel(requestedDate: String) = DailyCollection(
    date = date ?: requestedDate,
    totalMinor = totalMinor,
    byMethod = byMethod.map { MethodTotal(enumOrDefault(it.method, PaymentMethod.CASH), it.amountMinor, it.count) },
    byCashier = byCashier.map { CashierTotal(it.cashier?.name ?: it.name.orEmpty(), it.amountMinor, it.count) },
    payments = payments.map { it.toModel() },
    closing = closed?.let {
        DayClosing(it.closedBy?.name, it.closedAt, it.cashExpectedMinor, it.cashCountedMinor, it.differenceMinor, it.note?.takeIf(String::isNotBlank))
    },
    cashMinor = cashMinor,
)

internal fun FinanceDashboardDto.toModel() = FinanceOverview(
    billedMinor = billedMinor,
    collectedMinor = collectedMinor,
    outstandingMinor = outstandingMinor,
    overdueMinor = overdueMinor,
    collectionRate = if (collectionRate in 0.0..1.0 && collectedMinor > 0 && billedMinor > 0) collectionRate * 100 else collectionRate,
    expensesMinor = expensesMinor,
    payrollMinor = payrollMinor,
    todayCollectedMinor = todayCollectedMinor,
)
