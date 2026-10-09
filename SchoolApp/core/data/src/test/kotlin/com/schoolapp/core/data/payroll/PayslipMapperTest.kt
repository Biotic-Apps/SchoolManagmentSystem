package com.schoolapp.core.data.payroll

import com.schoolapp.core.network.NetworkJson
import com.schoolapp.core.network.dto.payroll.PayslipDto
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class PayslipMapperTest {

    // Shape of GET /payslips/me?month=2026-10 with the salary breakdown, trimmed.
    private val live = """{"id":"p1","month":"2026-10","staff":{"id":"s1","name":"Sara Ali","designation":"PRINCIPAL","employeeNo":"EMP-001"},
        "basicMinor":8000000,"allowancesMinor":1000000,"deductionsMinor":300000,"adjustmentsMinor":-50000,"overtimeMinutes":180,
        "overtimeMinor":153846,"grossMinor":9000000,"netMinor":8540000,"paidMinor":0,"balanceMinor":8540000,"status":"APPROVED",
        "pdf":{"status":"READY","fileUrl":"https://files/p1.pdf","generatedAt":"2026-10-09T10:00:00Z"},
        "breakdown":{"earnings":[{"label":"Basic salary","note":null,"amountMinor":8000000},
        {"label":"Overtime","note":"3 h × PKR 512.82 an hour (1.5× basic hourly)","amountMinor":153846}],
        "deductions":[{"label":"Absent days","note":"2 absent days: 2 days × PKR 2,629.63 a day","amountMinor":525926}],
        "totalEarningsMinor":8153846,"totalDeductionsMinor":525926,
        "attendance":{"calendarDays":31,"payDays":27,"present":22,"late":3,"absent":2,"halfDays":0,"paidLeave":1,"unpaidLeave":0,
        "unmarked":2,"perDayBase":"GROSS","perDayMinor":262963,"absenceHalfDays":4,"absenceDeductionMinor":525926,
        "latesPerDeduction":3,"lateDeductionDays":0.5,"lateHalfDays":1,"lateDeductionMinor":0},
        "overtime":{"minutes":180,"hourlyRateMinor":51282,"multiplier":1.5,"dailyHours":7.8,"amountMinor":153846,"entryIds":["o1"],"pendingMinutes":30}}}"""

    private fun decode(json: String) = NetworkJson.decodeFromString(PayslipDto.serializer(), json).toModel()

    @Test
    fun designation_and_pdf_come_from_nested_objects() {
        val slip = decode(live)
        assertEquals("Sara Ali", slip.staffName)
        assertEquals("PRINCIPAL", slip.designation)
        assertEquals("https://files/p1.pdf", slip.pdfUrl)
        assertEquals(-50_000L, slip.adjustmentsMinor)
    }

    @Test
    fun breakdown_rows_attendance_and_overtime_are_mapped() {
        val slip = decode(live)
        assertEquals(listOf("Basic salary", "Overtime"), slip.earnings.map { it.label })
        assertNull(slip.earnings.first().note)
        assertEquals("2 absent days: 2 days × PKR 2,629.63 a day", slip.deductionItems.single().note)
        assertEquals(8_153_846L, slip.totalEarningsMinor)
        assertEquals(525_926L, slip.totalDeductionsMinor)
        assertEquals(27, slip.attendance?.payDays)
        assertEquals(3, slip.attendance?.late)
        assertEquals(180, slip.overtimeMinutes)
        assertEquals(30, slip.overtime?.pendingMinutes)
    }

    @Test
    fun older_payslip_without_breakdown_still_parses() {
        val slip = decode("""{"month":"2026-08","name":"Old","designation":"TEACHER","basicMinor":100,"fileUrl":"f.pdf"}""")
        assertEquals("Old", slip.staffName)
        assertEquals("TEACHER", slip.designation)
        assertEquals("f.pdf", slip.pdfUrl)
        assertTrue(slip.earnings.isEmpty())
        assertNull(slip.attendance)
    }
}
