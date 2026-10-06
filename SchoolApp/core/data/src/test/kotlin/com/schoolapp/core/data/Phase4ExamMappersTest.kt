package com.schoolapp.core.data

import com.schoolapp.core.data.exams.toChildResults
import com.schoolapp.core.data.exams.toModel
import com.schoolapp.core.data.exams.withEntries
import com.schoolapp.core.model.exams.MarkEntry
import com.schoolapp.core.model.exams.MarkSheetStatus
import com.schoolapp.core.model.exams.ReportCardStatus
import com.schoolapp.core.network.NetworkJson
import com.schoolapp.core.network.dto.exams.MarkSheetDto
import com.schoolapp.core.network.dto.exams.ReportCardDto
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class Phase4ExamMappersTest {

    private val result1 = """{"studentId":"st1","name":"Ayesha","rollNo":1,"examId":"unit","examName":"Unit test","publishedAt":"2026-08-01T10:00:00Z",
        "subjects":[{"subjectId":"m","name":"Maths","marks":40,"maxMarks":50,"absent":false,"grade":"A","passed":true}],
        "totalMarks":40,"maxTotal":50,"percent":80,"grade":"A","position":2,"passed":true,"remarks":" ","teacherRemark":"Good"}"""
    private val result2 = """{"studentId":"st1","name":"Ayesha","rollNo":1,"exam":{"id":"mid","name":"Mid-term"},"publishedAt":"2026-09-20T10:00:00Z",
        "subjects":[{"subjectId":"m","name":"Maths","marks":12,"maxMarks":50,"absent":true,"grade":null,"passed":false}],
        "totalMarks":0,"maxTotal":50,"percent":0,"grade":"F","position":null,"passed":false}"""

    @Test
    fun results_object_with_trend_keeps_server_trend() {
        val json = NetworkJson.parseToJsonElement(
            """{"results":[$result1,$result2],"trend":[{"examId":"unit","examName":"Unit test","percent":80},{"examId":"mid","name":"Mid-term","percent":0}]}""",
        )
        val child = json.toChildResults(NetworkJson)

        assertEquals(listOf("mid", "unit"), child.results.map { it.examId })
        assertEquals("Mid-term", child.results[0].examName)
        assertEquals(listOf("Unit test", "Mid-term"), child.trend.map { it.examName })
        assertNull(child.results[1].remarks)
        assertEquals("Good", child.results[1].teacherRemark)
    }

    @Test
    fun plain_array_falls_back_to_trend_from_results_oldest_first() {
        val child = NetworkJson.parseToJsonElement("[$result2,$result1]").toChildResults(NetworkJson)

        assertEquals(listOf("mid", "unit"), child.results.map { it.examId })
        assertEquals(listOf("unit", "mid"), child.trend.map { it.examId })
        assertEquals(listOf(80.0, 0.0), child.trend.map { it.percent })
    }

    @Test
    fun absent_subject_has_no_marks() {
        val child = NetworkJson.parseToJsonElement("[$result2]").toChildResults(NetworkJson)
        val maths = child.results.single().subjects.single()
        assertTrue(maths.absent)
        assertNull(maths.marks)
    }

    @Test
    fun mark_sheet_keeps_pending_null_and_zero_entered() {
        val dto = NetworkJson.decodeFromString(
            MarkSheetDto.serializer(),
            """{"id":"ms1","examId":"ex1","paper":{"className":"Class 5","subject":{"id":"m","name":"Maths"},"maxMarks":100,"passMarks":33,"date":"2026-10-01"},
               "sectionId":"sec","sectionName":"A","status":"DRAFT","entered":99,"total":99,
               "rows":[{"studentId":"s2","name":"B","rollNo":2,"marks":null,"absent":false},
                       {"studentId":"s1","name":"A","rollNo":1,"marks":0,"absent":false},
                       {"studentId":"s3","name":"C","rollNo":3,"marks":55,"absent":true,"remark":" "}]}""",
        )
        val sheet = dto.toModel("Final exam")

        assertEquals(listOf("s1", "s2", "s3"), sheet.rows.map { it.studentId })
        assertEquals(0.0, sheet.rows[0].marks)
        assertFalse(sheet.rows[0].isPending)
        assertNull(sheet.rows[1].marks)
        assertTrue(sheet.rows[1].isPending)
        assertNull(sheet.rows[2].marks)
        assertFalse(sheet.rows[2].isPending)
        assertNull(sheet.rows[2].remark)
        assertEquals(2, sheet.entered)
        assertEquals(3, sheet.total)
        assertEquals("Final exam", sheet.examName)
        assertEquals("Class 5-A · Maths", sheet.title)
        assertEquals(MarkSheetStatus.DRAFT, sheet.status)
    }

    @Test
    fun list_sheet_without_rows_uses_server_counts_and_unknown_status_defaults() {
        val sheet = NetworkJson.decodeFromString(
            MarkSheetDto.serializer(),
            """{"id":"ms1","examId":"ex1","exam":{"id":"ex1","name":"Mid"},"sectionId":"sec","status":"NEW_THING","entered":4,"total":30}""",
        ).toModel("Ignored")

        assertEquals(4, sheet.entered)
        assertEquals(30, sheet.total)
        assertEquals("Mid", sheet.examName)
        assertEquals(MarkSheetStatus.NOT_ENTERED, sheet.status)
    }

    @Test
    fun queued_entries_overlay_server_rows() {
        val sheet = NetworkJson.decodeFromString(
            MarkSheetDto.serializer(),
            """{"id":"ms1","examId":"ex1","sectionId":"sec","rows":[{"studentId":"s1","name":"A","rollNo":1,"marks":10,"absent":false},
               {"studentId":"s2","name":"B","rollNo":2,"marks":null,"absent":false}]}""",
        ).toModel()

        val merged = sheet.withEntries(listOf(MarkEntry("s1", 15.0, absent = true), MarkEntry("s2", 0.0, absent = false)))

        assertNull(merged.rows[0].marks)
        assertTrue(merged.rows[0].absent)
        assertEquals(0.0, merged.rows[1].marks)
        assertEquals(2, merged.entered)
    }

    @Test
    fun report_card_status_falls_back_to_file_presence() {
        assertEquals(ReportCardStatus.READY, ReportCardDto(fileUrl = "https://f/x.pdf").toModel().status)
        assertEquals(ReportCardStatus.PENDING, ReportCardDto().toModel().status)
        assertEquals(ReportCardStatus.FAILED, ReportCardDto(status = "FAILED").toModel().status)
    }
}
