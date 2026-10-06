package com.schoolapp.demo

import com.schoolapp.core.model.fees.CashierTotal
import com.schoolapp.core.model.fees.DailyCollection
import com.schoolapp.core.model.fees.DuesAging
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
import com.schoolapp.core.model.people.StudentSummary
import kotlinx.coroutines.flow.MutableStateFlow
import java.time.LocalDate
import java.time.YearMonth
import java.time.temporal.ChronoUnit
import java.util.concurrent.atomic.AtomicInteger

/**
 * Phase 4 fee seed (contract §J): three months of invoices for Ayesha and Omar (PAID, OVERDUE, PARTIALLY_PAID),
 * one SUBMITTED parent proof, branch dues with aging, today's collection and yesterday closed. Amounts in paisa.
 */
internal object DemoFeesData {
    const val CURRENCY = "PKR"
    const val CASHIER = "Nadia Farooq"

    val feeHeads = listOf("Tuition", "Admission", "Exam", "Transport", "Computer Lab")

    private val today: LocalDate get() = DemoDates.today()
    private val receiptSeq = AtomicInteger(235)
    private val idSeq = AtomicInteger(1)

    val invoices = MutableStateFlow(seedInvoices())
    val proofs = MutableStateFlow(seedProofs())
    val counterPayments = MutableStateFlow(seedCounterPayments())
    val otherDues = MutableStateFlow(seedOtherDues())

    /** Days the office has closed; back-dated cash on these days is refused (423). */
    val closedDates: Set<String> get() = setOf(today.minusDays(1).toString())

    fun nextId(prefix: String) = "demo-$prefix-${idSeq.getAndIncrement()}"

    fun nextReceipt(): String = receipt(receiptSeq.getAndIncrement())

    fun student(id: String): StudentSummary? = DemoPeopleData.students.firstOrNull { it.id == id }

    fun statusFor(paid: Long, balance: Long, dueDate: String?): InvoiceStatus = when {
        balance <= 0 -> InvoiceStatus.PAID
        dueDate != null && dueDate < today.toString() -> InvoiceStatus.OVERDUE
        paid > 0 -> InvoiceStatus.PARTIALLY_PAID
        else -> InvoiceStatus.ISSUED
    }

    fun summary(studentId: String): FeeSummary {
        val mine = invoices.value.filter { it.studentId == studentId }
        val payable = mine.filter { it.isPayable }
        val lastPayment = mine.flatMap { it.payments }.maxByOrNull { it.paidOn.orEmpty() }
        val next = payable.filter { it.status != InvoiceStatus.OVERDUE }.minByOrNull { it.dueDate.orEmpty() } ?: payable.minByOrNull { it.dueDate.orEmpty() }
        return FeeSummary(
            totalDueMinor = payable.sumOf { it.balanceMinor },
            overdueMinor = payable.filter { it.status == InvoiceStatus.OVERDUE }.sumOf { it.balanceMinor },
            advanceMinor = 0,
            lastPayment = lastPayment?.let { LastPayment(it.amountMinor, it.paidOn, it.receiptNo) },
            nextDue = next?.let { NextDue(it.balanceMinor, it.dueDate, it.invoiceNo) },
            currency = CURRENCY,
            proofUploadEnabled = true,
            onlineGatewayEnabled = false,
        )
    }

    fun dues(): List<DuesRow> {
        val childRows = invoices.value.filter { it.isPayable }.groupBy { it.studentId.orEmpty() }.map { (studentId, open) ->
            val student = student(studentId)
            val buckets = LongArray(4)
            open.forEach { buckets[bucketOf(daysPast(it.dueDate))] += it.balanceMinor }
            DuesRow(
                studentId = studentId,
                studentName = student?.name ?: open.first().studentName,
                admissionNo = student?.admissionNo,
                className = student?.className,
                sectionName = student?.sectionName,
                balanceMinor = open.sumOf { it.balanceMinor },
                oldestDueDays = open.maxOf { daysPast(it.dueDate) },
                aging = DuesAging(buckets[0], buckets[1], buckets[2], buckets[3]),
            )
        }
        return (childRows + otherDues.value).filter { it.balanceMinor > 0 }.sortedByDescending { it.balanceMinor }
    }

    fun collection(date: String): DailyCollection {
        val payments = counterPayments.value.filter { it.receivedOn == date }
        return DailyCollection(
            date = date,
            totalMinor = payments.sumOf { it.amountMinor },
            byMethod = payments.groupBy { it.method }.map { (method, list) -> MethodTotal(method, list.sumOf { it.amountMinor }, list.size) }
                .sortedByDescending { it.amountMinor },
            byCashier = payments.groupBy { it.cashierName.orEmpty() }.map { (name, list) -> CashierTotal(name, list.sumOf { it.amountMinor }, list.size) }
                .sortedByDescending { it.amountMinor },
            payments = payments.sortedByDescending { it.receiptNo.orEmpty() },
            closed = date < today.toString(),
        )
    }

    fun overview(): FinanceOverview {
        val todayTotal = collection(today.toString()).totalMinor
        val month = YearMonth.from(today).toString()
        val collected = MONTH_COLLECTED_BEFORE_TODAY + counterPayments.value.filter { it.receivedOn?.startsWith(month) == true }.sumOf { it.amountMinor }
        val dues = dues()
        val outstanding = dues.sumOf { it.balanceMinor }
        val overdue = dues.sumOf { row -> row.aging?.let { it.upTo60Minor + it.upTo90Minor + it.over90Minor } ?: 0L }
        val billed = collected + outstanding
        return FinanceOverview(
            billedMinor = billed,
            collectedMinor = collected,
            outstandingMinor = outstanding,
            overdueMinor = overdue,
            collectionRate = if (billed > 0) collected * PERCENT / billed else 0.0,
            expensesMinor = 41_250_000,
            payrollMinor = 96_400_000,
            todayCollectedMinor = todayTotal,
        )
    }

    /** Applies [amount] to the student's open invoices (preferring [invoiceId], then oldest due first). */
    fun allocate(studentId: String, amount: Long, payment: InvoicePayment, invoiceId: String? = null): Boolean {
        var left = amount
        var applied = false
        invoices.value = invoices.value.let { all ->
            val order = all.filter { it.studentId == studentId && it.isPayable }
                .sortedWith(compareBy<Invoice> { it.id != invoiceId }.thenBy { it.dueDate.orEmpty() })
                .map { it.id }
            val updates = mutableMapOf<String, Invoice>()
            order.forEach { id ->
                if (left <= 0) return@forEach
                val invoice = all.first { it.id == id }
                val part = minOf(left, invoice.balanceMinor)
                left -= part
                applied = true
                val paid = invoice.paidMinor + part
                val balance = invoice.balanceMinor - part
                updates[id] = invoice.copy(
                    paidMinor = paid,
                    balanceMinor = balance,
                    status = statusFor(paid, balance, invoice.dueDate),
                    payments = (listOf(payment.copy(amountMinor = part)) + invoice.payments),
                )
            }
            all.map { updates[it.id] ?: it }
        }
        return applied
    }

    /** Reduces a seeded dues row (students without demo invoices), oldest bucket first. */
    fun reduceOtherDues(studentId: String, amount: Long) {
        otherDues.value = otherDues.value.map { row ->
            if (row.studentId != studentId) return@map row
            var left = amount
            fun take(bucket: Long): Long = minOf(bucket, left).also { left -= it }.let { bucket - it }
            val aging = row.aging?.let { a ->
                val over90 = take(a.over90Minor)
                val upTo90 = take(a.upTo90Minor)
                val upTo60 = take(a.upTo60Minor)
                val upTo30 = take(a.upTo30Minor)
                DuesAging(upTo30, upTo60, upTo90, over90)
            }
            row.copy(balanceMinor = (row.balanceMinor - amount).coerceAtLeast(0), aging = aging)
        }
    }

    private fun daysPast(dueDate: String?): Int =
        dueDate?.let { runCatching { ChronoUnit.DAYS.between(LocalDate.parse(it), today).toInt() }.getOrNull() }?.coerceAtLeast(0) ?: 0

    private fun bucketOf(days: Int): Int = when {
        days <= 30 -> 0
        days <= 60 -> 1
        days <= 90 -> 2
        else -> 3
    }

    private fun receipt(seq: Int) = "RCT-MAIN-${today.year}-%04d".format(seq)

    private fun seedInvoices(): List<Invoice> {
        val m0 = YearMonth.from(today)
        val m1 = m0.minusMonths(1)
        val m2 = m0.minusMonths(2)
        val currentDue = m0.atDay(10).let { if (it.isBefore(today)) today.plusDays(5) else it }
        val ayesha = listOf("Tuition" to 850_000L, "Transport" to 300_000L, "Computer Lab" to 120_000L)
        val omar = listOf("Tuition" to 750_000L, "Transport" to 300_000L)
        val exam = "Exam" to 150_000L
        return listOf(
            invoice("demo-inv-a2", 12, DemoPeopleData.CHILD_1, m2, m2.atDay(10), ayesha, payments = listOf(paid("demo-pay-a2", 101, 1_270_000, m2.atDay(7)))),
            invoice("demo-inv-a1", 12, DemoPeopleData.CHILD_1, m1, m1.atDay(10), ayesha + exam, lateFee = 50_000),
            invoice(
                "demo-inv-a0", 12, DemoPeopleData.CHILD_1, m0, currentDue, ayesha,
                concession = 85_000,
                payments = listOf(paid("demo-pay-a0", 214, 500_000, minOf(m0.atDay(2), today))),
            ),
            invoice("demo-inv-o2", 31, DemoPeopleData.CHILD_2, m2, m2.atDay(10), omar, payments = listOf(paid("demo-pay-o2", 102, 1_050_000, m2.atDay(8)))),
            invoice("demo-inv-o1", 31, DemoPeopleData.CHILD_2, m1, m1.atDay(10), omar + exam, lateFee = 50_000),
            invoice(
                "demo-inv-o0", 31, DemoPeopleData.CHILD_2, m0, currentDue, omar,
                concession = 75_000,
                payments = listOf(paid("demo-pay-o0", 215, 400_000, minOf(m0.atDay(3), today))),
            ),
        )
    }

    private fun paid(id: String, seq: Int, amount: Long, on: LocalDate) = InvoicePayment(id, receipt(seq), amount, on.toString())

    @Suppress("LongParameterList")
    private fun invoice(
        id: String,
        seq: Int,
        studentId: String,
        month: YearMonth,
        due: LocalDate,
        lines: List<Pair<String, Long>>,
        concession: Long = 0,
        lateFee: Long = 0,
        payments: List<InvoicePayment> = emptyList(),
    ): Invoice {
        val student = student(studentId)
        val total = lines.sumOf { it.second } - concession + lateFee
        val paid = payments.sumOf { it.amountMinor }
        return Invoice(
            id = id,
            invoiceNo = "INV-MAIN-%d%02d-%04d".format(month.year, month.monthValue, seq),
            studentId = studentId,
            studentName = student?.name.orEmpty(),
            admissionNo = student?.admissionNo,
            className = student?.className,
            sectionName = student?.sectionName,
            period = month.toString(),
            issueDate = month.atDay(1).toString(),
            dueDate = due.toString(),
            status = statusFor(paid, total - paid, due.toString()),
            lines = lines.mapIndexed { index, (head, amount) ->
                InvoiceLine("$id-l$index", head, if (head == "Exam") "Mid-term exam fee" else null, amount)
            },
            concessionMinor = concession,
            lateFeeMinor = lateFee,
            totalMinor = total,
            paidMinor = paid,
            balanceMinor = total - paid,
            payments = payments,
            currency = CURRENCY,
        )
    }

    private fun seedProofs(): List<PaymentProof> = listOf(
        PaymentProof(
            id = "demo-proof-1",
            invoiceId = "demo-inv-a1",
            invoiceNo = invoices.value.first { it.id == "demo-inv-a1" }.invoiceNo,
            studentName = "Ayesha Khan",
            amountMinor = 1_470_000,
            paidOn = today.minusDays(1).toString(),
            method = ProofMethod.BANK,
            reference = "HBL-FT-558120",
            fileUrl = null,
            fileMime = "image/jpeg",
            status = ProofStatus.SUBMITTED,
            reason = null,
            submittedBy = DemoActors.parent.name,
            createdAt = DemoDates.iso(today.minusDays(1), "19:40"),
        ),
    )

    private fun seedCounterPayments(): List<Payment> {
        val todayKey = today.toString()
        val yesterday = today.minusDays(1).toString()
        return listOf(
            counter(229, "Zainab Ali", 1_270_000, PaymentMethod.CASH, null, yesterday),
            counter(230, "Maryam Raza", 850_000, PaymentMethod.CASH, null, yesterday),
            counter(231, "Bilal Ahmed", 1_270_000, PaymentMethod.CASH, null, todayKey),
            counter(232, "Hira Javed", 1_270_000, PaymentMethod.BANK, "HBL-FT-1192", todayKey),
            counter(233, "Ibrahim Shah", 500_000, PaymentMethod.CASH, null, todayKey),
            counter(234, "Sana Pervez", 1_050_000, PaymentMethod.CHEQUE, "CHQ 004512 MCB", todayKey, cashier = DemoActors.principal.name),
        )
    }

    @Suppress("LongParameterList")
    private fun counter(seq: Int, name: String, amount: Long, method: PaymentMethod, reference: String?, on: String, cashier: String = CASHIER): Payment {
        val student = DemoPeopleData.students.firstOrNull { it.name == name }
        return Payment(
            id = "demo-cpay-$seq",
            receiptNo = receipt(seq),
            studentId = student?.id,
            studentName = name,
            amountMinor = amount,
            method = method,
            reference = reference,
            receivedOn = on,
            cashierName = cashier,
            status = "RECORDED",
        )
    }

    private fun seedOtherDues(): List<DuesRow> = listOf(
        due("Daniyal Butt", 3_150_000, 68, DuesAging(1_050_000, 1_050_000, 1_050_000, 0)),
        due("Fatima Noor", 2_540_000, 97, DuesAging(1_270_000, 0, 0, 1_270_000)),
        due("Usman Tariq", 1_270_000, 36, DuesAging(0, 1_270_000, 0, 0)),
        due("Saad Hussain", 850_000, 12, DuesAging(850_000, 0, 0, 0)),
        due("Rayyan Aslam", 400_000, 5, DuesAging(400_000, 0, 0, 0)),
    )

    private fun due(name: String, balance: Long, days: Int, aging: DuesAging): DuesRow {
        val student = DemoPeopleData.students.first { it.name == name }
        return DuesRow(student.id, student.name, student.admissionNo, student.className, student.sectionName, balance, days, aging)
    }

    /** Collected earlier this month before the demo's counter payments (keeps the overview realistic). */
    private const val MONTH_COLLECTED_BEFORE_TODAY = 131_240_000L
    private const val PERCENT = 100.0
}
