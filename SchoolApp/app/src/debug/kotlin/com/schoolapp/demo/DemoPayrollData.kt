package com.schoolapp.demo

import com.schoolapp.core.model.payroll.PayItem
import com.schoolapp.core.model.payroll.PayrollLine
import com.schoolapp.core.model.payroll.PayrollRun
import com.schoolapp.core.model.payroll.PayrollRunStatus
import com.schoolapp.core.model.payroll.Payslip
import kotlinx.coroutines.flow.MutableStateFlow
import java.time.YearMonth
import java.time.temporal.ChronoUnit

/**
 * Seed §J: salary structures for the demo staff, an older CLOSED run, last month PAID and the current month
 * CALCULATED (unpaid). Amounts are PKR minor units; payslip PDFs are not generated in the demo (pdfUrl = null).
 */
internal object DemoPayrollData {
    private const val DAYS_IN_MONTH = 30

    private data class Structure(
        val staffId: String,
        val name: String,
        val designation: String,
        val basic: Long,
        val allowances: List<PayItem>,
        val deductions: List<PayItem>,
        val unpaidLeaveDays: Double = 0.0,
        val adjustments: Long = 0,
    )

    private val structures = listOf(
        Structure(
            "demo-staff-01", "Demo Teacher", "Senior Teacher", 6_500_000,
            listOf(PayItem("House rent", 1_000_000), PayItem("Conveyance", 500_000)),
            listOf(PayItem("Provident fund", 325_000), PayItem("Income tax", 75_000)),
        ),
        Structure(
            "demo-staff-02", "Sana Iqbal", "Coordinator", 8_500_000,
            listOf(PayItem("House rent", 1_500_000), PayItem("Conveyance", 500_000)),
            listOf(PayItem("Provident fund", 425_000), PayItem("Income tax", 180_000)),
        ),
        Structure(
            "demo-staff-03", "Usman Raza", "Accountant", 5_500_000,
            listOf(PayItem("House rent", 800_000), PayItem("Conveyance", 400_000)),
            listOf(PayItem("Provident fund", 275_000)),
        ),
        Structure(
            "demo-staff-04", "Bilal Ahmed", "Teacher", 5_200_000,
            listOf(PayItem("House rent", 750_000), PayItem("Conveyance", 350_000)),
            listOf(PayItem("Provident fund", 260_000)),
            unpaidLeaveDays = 1.0,
        ),
        Structure(
            "demo-staff-05", "Hina Shah", "Teacher", 5_400_000,
            listOf(PayItem("House rent", 750_000), PayItem("Conveyance", 350_000)),
            listOf(PayItem("Provident fund", 270_000)),
            adjustments = 500_000,
        ),
        Structure(
            "demo-staff-06", "Kamran Ali", "Teacher (new)", 4_500_000,
            listOf(PayItem("House rent", 600_000), PayItem("Conveyance", 200_000)),
            emptyList(),
        ),
    )

    private val Structure.allowancesMinor get() = allowances.sumOf { it.amountMinor }
    private val Structure.deductionsMinor get() = deductions.sumOf { it.amountMinor }
    private val Structure.leaveDeductionMinor get() = (basic * unpaidLeaveDays / DAYS_IN_MONTH).toLong() / 100 * 100
    private val Structure.netMinor get() = basic + allowancesMinor - deductionsMinor - leaveDeductionMinor + adjustments

    private fun Structure.line(paid: Boolean, status: String) = PayrollLine(
        staffId = staffId, name = name, designation = designation, basicMinor = basic, allowancesMinor = allowancesMinor,
        deductionsMinor = deductionsMinor, unpaidLeaveDays = unpaidLeaveDays, leaveDeductionMinor = leaveDeductionMinor,
        adjustmentsMinor = adjustments, netMinor = netMinor, paidMinor = if (paid) netMinor else 0,
        balanceMinor = if (paid) 0 else netMinor, status = status,
    )

    private fun run(id: String, month: YearMonth, status: PayrollRunStatus): PayrollRun {
        val paid = status == PayrollRunStatus.PAID || status == PayrollRunStatus.CLOSED
        val lines = structures.map { it.line(paid, if (paid) "PAID" else status.name) }
        return PayrollRun(
            id = id,
            branchName = DemoData.MAIN_BRANCH_NAME,
            month = month.toString(),
            status = status,
            staffCount = lines.size,
            netMinor = lines.sumOf { it.netMinor },
            paidMinor = lines.sumOf { it.paidMinor },
            balanceMinor = lines.sumOf { it.balanceMinor },
            approvalId = if (paid) "demo-ap-pr-${month}" else null,
            lines = lines,
        )
    }

    private val currentMonth: YearMonth get() = YearMonth.from(DemoDates.today())

    val runs = MutableStateFlow(
        listOf(
            run("demo-pr-current", currentMonth, PayrollRunStatus.CALCULATED),
            run("demo-pr-last", currentMonth.minusMonths(1), PayrollRunStatus.PAID),
            run("demo-pr-older", currentMonth.minusMonths(2), PayrollRunStatus.CLOSED),
        ),
    )

    /** Net of the current month's run, used by the PAYROLL demo approval. */
    val currentNetMinor: Long get() = runs.value.first().netMinor

    /** The signed-in demo staff member's payslip: current month CALCULATED, the three before PAID; older months none. */
    fun payslip(month: String, actor: String): Payslip? {
        val ym = runCatching { YearMonth.parse(month) }.getOrNull() ?: return null
        val monthsBack = ChronoUnit.MONTHS.between(ym, currentMonth)
        if (monthsBack !in 0..PAYSLIP_HISTORY) return null
        val known = structures.firstOrNull { it.name == actor }
        val structure = known ?: structures.last()
        val paid = monthsBack > 0
        val line = structure.line(paid, if (paid) "PAID" else PayrollRunStatus.CALCULATED.name)
        return Payslip(
            month = ym.toString(),
            staffName = actor,
            designation = known?.designation,
            basicMinor = structure.basic,
            allowances = structure.allowances,
            deductions = structure.deductions,
            allowancesMinor = line.allowancesMinor,
            deductionsMinor = line.deductionsMinor,
            unpaidLeaveDays = line.unpaidLeaveDays,
            leaveDeductionMinor = line.leaveDeductionMinor,
            adjustmentsMinor = line.adjustmentsMinor,
            netMinor = line.netMinor,
            paidMinor = line.paidMinor,
            balanceMinor = line.balanceMinor,
            status = line.status,
            pdfUrl = null,
            currency = "PKR",
        )
    }

    private const val PAYSLIP_HISTORY = 3L
}
