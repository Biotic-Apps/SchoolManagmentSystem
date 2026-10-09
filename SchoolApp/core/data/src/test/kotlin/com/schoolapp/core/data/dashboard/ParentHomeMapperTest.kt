package com.schoolapp.core.data.dashboard

import com.schoolapp.core.model.attendance.AttendanceStatus
import com.schoolapp.core.network.NetworkJson
import com.schoolapp.core.network.dto.dashboard.ParentHomeDto
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class ParentHomeMapperTest {

    private fun decode(json: String) = NetworkJson.decodeFromString(ParentHomeDto.serializer(), json).toModel()

    @Test
    fun full_payload_maps_child_attendance_fees_result_periods_and_events() {
        val home = decode(
            """{"child":{"id":"s1","name":"Ayesha Khan","photoUrl":"","admissionNo":"BS-2026-0010","className":"Class 5",
                 "sectionName":"A","rollNo":7,"branchName":"Main","branchPhone":"042-111","classTeacher":{"name":"Sara Ali","userId":"u9"}},
               "attendance":{"today":"LATE","month":{"month":"2026-10","present":5,"absent":1,"late":1,"leave":0,"halfDay":0,"percent":85.7}},
               "fees":{"totalDueMinor":485000,"overdueMinor":0,"advanceMinor":0,"balanceMinor":485000,"currency":"PKR",
                 "nextDue":{"invoiceId":"inv1","invoiceNo":"INV-1","dueDate":"2026-10-10","balanceMinor":485000},
                 "lastPayment":{"paymentId":"p1","receiptNo":"RCT-1","amountMinor":200000,"paidOn":"2026-10-02"},
                 "onlineGatewayEnabled":false,"proofUploadEnabled":true},
               "latestResult":{"examId":"e1","examName":"Mid Term","percent":78.5,"grade":"B","position":4,"passed":true,"publishedAt":null},
               "homework":{"dueCount":2,"nextDueDate":"2026-10-08"},
               "todayPeriods":[
                 {"date":"2026-10-06","day":2,"periodIndex":2,"periodNumber":2,"startTime":"08:40","endTime":"09:20",
                  "section":{"id":"sec1","name":"A","className":"Class 5"},"subject":{"id":"m","name":"Maths"},"staff":{"id":"st","name":"Sara Ali"},"room":null,"isSubstitute":false},
                 {"date":"2026-10-06","day":2,"periodIndex":1,"periodNumber":1,"startTime":"08:00","endTime":"08:40",
                  "section":{"id":"sec1","name":"A","className":"Class 5"},"subject":{"id":"e","name":"English"},"staff":{"id":"st2","name":"Omar"},"room":{"id":"r","name":"R1"},"isSubstitute":true}],
               "diary":[],"notices":[],"meetings":[],
               "events":[{"id":"ev1","kind":"HOLIDAY","title":"Iqbal Day","startDate":"2026-11-09","endDate":null}],
               "consentsPending":1}""",
        )
        assertEquals("Ayesha Khan", home.child.name)
        assertNull(home.child.photoUrl)
        assertEquals(7, home.child.rollNo)
        assertEquals("Sara Ali", home.child.classTeacherName)
        assertEquals(AttendanceStatus.LATE, home.attendance.today)
        assertEquals(85.7, home.attendance.month?.percent!!, 0.001)
        assertEquals(485_000L, home.fees?.totalDueMinor)
        assertEquals("inv1", home.fees?.nextDue?.invoiceId)
        assertEquals(485_000L, home.fees?.nextDue?.amountMinor)
        assertEquals("B", home.latestResult?.grade)
        assertEquals(4, home.latestResult?.position)
        assertEquals(2, home.homework.dueCount)
        assertEquals(listOf("English", "Maths"), home.todayPeriods.map { it.subjectName })
        assertTrue(home.todayPeriods.first().isSubstitute)
        assertEquals("HOLIDAY", home.events.single().type)
        assertEquals(1, home.consentsPending)
    }

    @Test
    fun minimal_payload_maps_unmarked_to_null_and_hides_fees() {
        val home = decode(
            """{"child":{"id":"s1","name":"Omar","admissionNo":"A-1","className":null,"sectionName":null,"rollNo":null,
                 "branchName":null,"branchPhone":null,"classTeacher":null},
               "attendance":{"today":"UNMARKED","month":{"month":"2026-10","present":0,"absent":0,"late":0,"leave":0,"halfDay":0,"percent":null}},
               "fees":null,"latestResult":null,"homework":{"dueCount":0,"nextDueDate":null},
               "todayPeriods":[],"diary":[],"notices":[],"meetings":[],"events":[],"consentsPending":0}""",
        )
        assertNull(home.attendance.today)
        assertNull(home.attendance.month?.percent)
        assertNull(home.fees)
        assertNull(home.latestResult)
        assertNull(home.child.classTeacherName)
        assertTrue(home.todayPeriods.isEmpty())
    }
}
