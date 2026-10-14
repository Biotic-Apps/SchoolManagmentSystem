package com.schoolapp.core.data.payroll

import com.schoolapp.core.model.payroll.PayrollRunStatus
import com.schoolapp.core.network.NetworkJson
import com.schoolapp.core.network.dto.payroll.PayrollRunDto
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class PayrollRunMapperTest {

    // Shape captured from GET /payroll/runs/{id} (principal, demo school), lines trimmed to one.
    private val live = """{"id":"01a110a4-9514-737f-9498-b29deb1f1d74","branch":{"id":"b1","name":"Main Branch"},"month":"2026-10",
        "status":"REVIEWED","currency":"PKR","calculatedAt":"2026-10-06T09:56:23.955Z","reviewedAt":"2026-10-07T10:40:26.590Z",
        "approvedAt":null,"approvedBy":null,"closedAt":null,"approval":APPROVAL,
        "totals":{"netMinor":54400000,"paidMinor":0,"balanceMinor":54400000},
        "lines":[{"id":"l1","staffId":"st1","name":"Demo Accountant","designation":"ACCOUNTANT","employeeNo":"EMP-003","basicMinor":7000000,
        "allowancesMinor":1200000,"deductionsMinor":350000,"workingDays":27,"unpaidLeaveDays":0,"leaveDeductionMinor":0,"adjustmentsMinor":0,
        "netMinor":7850000,"paidMinor":0,"balanceMinor":7850000,"status":"UNPAID","route":"BRANCH","approvalId":null}]}"""

    private fun decode(approval: String) = NetworkJson.decodeFromString(PayrollRunDto.serializer(), live.replace("APPROVAL", approval)).toModel()

    @Test
    fun run_totals_come_from_nested_totals_not_the_lines() {
        val run = decode("null")
        assertEquals(PayrollRunStatus.REVIEWED, run.status)
        assertEquals(54_400_000L, run.netMinor)
        assertEquals(54_400_000L, run.balanceMinor)
        assertEquals(0L, run.paidMinor)
        assertNull(run.approvalId)
    }

    @Test
    fun pending_approval_id_is_read_and_decided_ones_are_ignored() {
        assertEquals("a1", decode("""{"id":"a1","status":"PENDING"}""").approvalId)
        assertNull(decode("""{"id":"a1","status":"REJECTED"}""").approvalId)
    }

    @Test
    fun approval_status_overtime_count_and_gross_are_read() {
        val run = NetworkJson.decodeFromString(
            PayrollRunDto.serializer(),
            live.replace("APPROVAL", """{"id":"a1","status":"PENDING"}""").replace("\"totals\"", "\"pendingOvertimeCount\":2,\"totals\""),
        ).toModel()
        assertEquals("PENDING", run.approvalStatus)
        assertEquals(true, run.awaitingApproval)
        assertEquals(2, run.pendingOvertimeCount)
        assertEquals("PKR", run.currency)
        val line = run.lines.single()
        assertEquals("EMP-003", line.employeeNo)
        assertEquals(8_200_000L, line.gross)
        assertEquals(8_200_000L, line.totalEarnings)
        assertEquals(350_000L, line.totalDeductions)
    }
}
