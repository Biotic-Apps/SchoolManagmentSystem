package com.schoolapp.core.data.exams

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.fakes.CountingSyncScheduler
import com.schoolapp.core.data.fakes.InMemoryOutboxDao
import com.schoolapp.core.model.exams.Exam
import com.schoolapp.core.model.exams.ExamStatus
import com.schoolapp.core.model.exams.ExamType
import com.schoolapp.core.model.exams.StudentResult
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.NetworkJson
import com.schoolapp.core.network.dto.exams.ExamDto
import com.schoolapp.core.network.dto.exams.ExamTermDto
import com.schoolapp.core.network.dto.exams.StudentResultDto
import com.schoolapp.core.network.model.ApiEnvelope
import kotlinx.coroutines.test.UnconfinedTestDispatcher
import kotlinx.coroutines.test.runTest
import kotlinx.serialization.KSerializer
import kotlinx.serialization.builtins.ListSerializer
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test
import java.io.IOException

/** Payloads below were captured from the live API (`GET /exams`, `/sessions/:id/terms`, `/results`). */
class ExamResultsAndTermsTest {

    private val dispatcher = UnconfinedTestDispatcher()
    private val api = FakeExamsApi()
    private val repository = ApiCaller(NetworkJson, dispatcher).let { caller ->
        DefaultExamsRepository(api, caller, InMemoryOutboxDao(), CountingSyncScheduler(), NetworkJson, dispatcher, ExamTermNames(api, caller))
    }

    private fun <T> list(raw: String, serializer: KSerializer<T>): List<T> =
        NetworkJson.decodeFromString(ApiEnvelope.serializer(ListSerializer(serializer)), raw).data

    @Test
    fun exam_term_name_is_resolved_from_session_terms_and_cached() = runTest(dispatcher) {
        api.examsResponse = list(EXAMS_JSON, ExamDto.serializer())
        api.termsBySession = mapOf(SESSION to list(TERMS_JSON, ExamTermDto.serializer()))

        val exams = (repository.exams() as AppResult.Success<List<Exam>>).data
        repository.exams()

        assertEquals(listOf("Term 2", "Term 1"), exams.map { it.termName })
        assertEquals(listOf(ExamType.FINAL, ExamType.MIDTERM), exams.map { it.type })
        assertEquals(ExamStatus.PUBLISHED, exams[1].status)
        assertEquals("2026-10-06T09:56:22.132Z", exams[1].computedAt)
        assertEquals(SESSION, exams[0].sessionId)
        assertEquals(listOf(SESSION), api.termCalls)
    }

    @Test
    fun failed_term_lookup_leaves_term_blank_and_is_retried() = runTest(dispatcher) {
        api.examsResponse = list(EXAMS_JSON, ExamDto.serializer())
        api.termsFail = IOException("offline")

        val exams = (repository.exams() as AppResult.Success<List<Exam>>).data
        repository.exams()

        assertNull(exams[0].termName)
        assertEquals(2, api.termCalls.size)
    }

    @Test
    fun embedded_term_name_wins_without_a_lookup() = runTest(dispatcher) {
        api.examsResponse = listOf(ExamDto(id = "e1", name = "Unit 1", sessionId = SESSION, termId = "t1", termName = "Spring"))
        val exams = (repository.exams() as AppResult.Success<List<Exam>>).data
        assertEquals("Spring", exams.single().termName)
        assertEquals(emptyList<String>(), api.termCalls)
    }

    @Test
    fun section_results_map_live_payload() = runTest(dispatcher) {
        api.resultsResponse = list(RESULTS_JSON, StudentResultDto.serializer())

        val results = (repository.sectionResults(EXAM, SECTION) as AppResult.Success<List<StudentResult>>).data

        assertEquals(EXAM to SECTION, api.lastResultsQuery)
        val first = results.first()
        assertEquals("Ayesha Javed", first.name)
        assertEquals(1, first.rollNo)
        assertEquals(SECTION, first.sectionId)
        assertEquals("01a1100a-a060-721a-801d-ed6a56359282", first.classId)
        assertEquals(270.0, first.totalMarks, 0.0)
        assertEquals(400.0, first.maxTotal, 0.0)
        assertEquals(67.5, first.percent, 0.0)
        assertEquals("C", first.grade)
        assertEquals(4, first.position)
        assertEquals("Good", first.remarks)
        assertNull(first.teacherRemark)
        assertEquals(listOf("English", "Urdu", "Mathematics", "General Science"), first.subjects.map { it.name })
        assertEquals(93.0, first.subjects[3].marks)
        assertEquals("A+", first.subjects[3].grade)
        assertEquals(listOf(1, 2), results.map { it.rollNo })
    }

    private companion object {
        const val SESSION = "01a1100a-9fca-74c3-bea8-1240fbd9cad0"
        const val EXAM = "01a110a4-8dfa-76c2-b756-5cceaae4b01a"
        const val SECTION = "01a1100a-a068-7279-affc-e9165fd0fa87"

        val EXAMS_JSON = """{"data":[{"id":"01a110a4-8ef8-758c-bce8-c2b34ba46dd9","schoolId":"01a1100a-9fb7-75fc-87d3-440ac25d9892","branchId":"01a1100a-9fc0-755c-b84b-abbfa92b7671","sessionId":"01a1100a-9fca-74c3-bea8-1240fbd9cad0","termId":"01a1100a-9fd8-761c-a7d8-4b49b82835e3","name":"Final 2027","type":"FINAL","gradingScheme":{"id":"01a110a4-8ddd-734e-87cd-253d2d0b0cf2","name":"Standard 2026-27"},"weightPercent":60,"classIds":["01a1100a-a04f-72b4-905d-cc833d4d7e51","01a1100a-a060-721a-801d-ed6a56359282"],"classes":[{"id":"01a1100a-a04f-72b4-905d-cc833d4d7e51","name":"Class 4"},{"id":"01a1100a-a060-721a-801d-ed6a56359282","name":"Class 5"}],"status":"MARKS_OPEN","approvalId":null,"computedAt":null,"publishedAt":null,"papers":[],"createdAt":"2026-10-06T09:56:22.392Z"},{"id":"01a110a4-8dfa-76c2-b756-5cceaae4b01a","schoolId":"01a1100a-9fb7-75fc-87d3-440ac25d9892","branchId":"01a1100a-9fc0-755c-b84b-abbfa92b7671","sessionId":"01a1100a-9fca-74c3-bea8-1240fbd9cad0","termId":"01a1100a-9fd3-7129-b24d-19b9a38d05c8","name":"Mid-term 2026","type":"MIDTERM","gradingScheme":{"id":"01a110a4-8ddd-734e-87cd-253d2d0b0cf2","name":"Standard 2026-27"},"weightPercent":40,"classIds":["01a1100a-a04f-72b4-905d-cc833d4d7e51","01a1100a-a060-721a-801d-ed6a56359282"],"classes":[{"id":"01a1100a-a04f-72b4-905d-cc833d4d7e51","name":"Class 4"},{"id":"01a1100a-a060-721a-801d-ed6a56359282","name":"Class 5"}],"status":"PUBLISHED","approvalId":null,"computedAt":"2026-10-06T09:56:22.132Z","publishedAt":"2026-10-06T09:56:22.132Z","papers":[],"createdAt":"2026-10-06T09:56:22.138Z"}],"meta":{"page":1,"pageSize":20,"total":2}}"""

        val TERMS_JSON = """{"data":[{"id":"01a1100a-9fd3-7129-b24d-19b9a38d05c8","sessionId":"01a1100a-9fca-74c3-bea8-1240fbd9cad0","name":"Term 1","startDate":"2026-04-01","endDate":"2026-09-30"},{"id":"01a1100a-9fd8-761c-a7d8-4b49b82835e3","sessionId":"01a1100a-9fca-74c3-bea8-1240fbd9cad0","name":"Term 2","startDate":"2026-10-01","endDate":"2027-03-31"}]}"""

        val RESULTS_JSON = """{"data":[{"studentId":"01a1100a-a9ea-77da-9b0f-96476f2ae70f","name":"Ayesha Javed","rollNo":1,"examId":"01a110a4-8dfa-76c2-b756-5cceaae4b01a","classId":"01a1100a-a060-721a-801d-ed6a56359282","sectionId":"01a1100a-a068-7279-affc-e9165fd0fa87","subjects":[{"subjectId":"01a1100a-9fde-707e-917f-819fd6d30cfe","name":"English","marks":42,"maxMarks":100,"absent":false,"grade":"E","passed":true},{"subjectId":"01a1100a-9fe3-70ce-913d-ba0a37fc6e6d","name":"Urdu","marks":59,"maxMarks":100,"absent":false,"grade":"D","passed":true},{"subjectId":"01a1100a-9fe6-72dc-b05a-602c6487b375","name":"Mathematics","marks":76,"maxMarks":100,"absent":false,"grade":"B","passed":true},{"subjectId":"01a1100a-9fe9-711b-9c60-110cf66f48b1","name":"General Science","marks":93,"maxMarks":100,"absent":false,"grade":"A+","passed":true}],"totalMarks":270,"maxTotal":400,"percent":67.5,"grade":"C","position":4,"passed":true,"remarks":"Good","teacherRemark":null},{"studentId":"01a1100a-a9f3-7188-83ba-cbb130bceb70","name":"Hamza Butt","rollNo":2,"examId":"01a110a4-8dfa-76c2-b756-5cceaae4b01a","classId":"01a1100a-a060-721a-801d-ed6a56359282","sectionId":"01a1100a-a068-7279-affc-e9165fd0fa87","subjects":[{"subjectId":"01a1100a-9fde-707e-917f-819fd6d30cfe","name":"English","marks":79,"maxMarks":100,"absent":false,"grade":"B","passed":true},{"subjectId":"01a1100a-9fe3-70ce-913d-ba0a37fc6e6d","name":"Urdu","marks":96,"maxMarks":100,"absent":false,"grade":"A+","passed":true},{"subjectId":"01a1100a-9fe6-72dc-b05a-602c6487b375","name":"Mathematics","marks":49,"maxMarks":100,"absent":false,"grade":"E","passed":true},{"subjectId":"01a1100a-9fe9-711b-9c60-110cf66f48b1","name":"General Science","marks":66,"maxMarks":100,"absent":false,"grade":"C","passed":true}],"totalMarks":290,"maxTotal":400,"percent":72.5,"grade":"B","position":1,"passed":true,"remarks":"Very good","teacherRemark":null}]}"""
    }
}
