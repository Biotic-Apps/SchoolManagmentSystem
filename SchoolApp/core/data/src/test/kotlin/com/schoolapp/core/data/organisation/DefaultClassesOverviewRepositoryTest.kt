package com.schoolapp.core.data.organisation

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.fakes.httpError
import com.schoolapp.core.model.organisation.ClassIssue
import com.schoolapp.core.model.organisation.ClassOverview
import com.schoolapp.core.model.timetable.TimetableState
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.NetworkJson
import com.schoolapp.core.network.api.OrganisationApi
import com.schoolapp.core.network.dto.organisation.ClassOverviewDto
import com.schoolapp.core.network.dto.organisation.SchoolClassDto
import com.schoolapp.core.network.dto.organisation.SectionDto
import com.schoolapp.core.network.model.ApiEnvelope
import kotlinx.coroutines.test.UnconfinedTestDispatcher
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test
import java.lang.reflect.Proxy

class DefaultClassesOverviewRepositoryTest {

    private val dispatcher = UnconfinedTestDispatcher()
    private var overviewFailure: RuntimeException? = null
    private var overview: List<ClassOverviewDto> = emptyList()
    private val calls = mutableListOf<String>()

    private val api = Proxy.newProxyInstance(OrganisationApi::class.java.classLoader, arrayOf(OrganisationApi::class.java)) { _, method, _ ->
        calls += method.name
        when (method.name) {
            "classesOverview" -> overviewFailure?.let { throw it } ?: ApiEnvelope(overview)
            "classes" -> ApiEnvelope(
                listOf(SchoolClassDto("c2", name = "Class 2", levelOrder = 2, subjectCount = 7), SchoolClassDto("c1", name = "Class 1", levelOrder = 1)),
            )
            "sections" -> ApiEnvelope(
                listOf(
                    SectionDto("s2", classId = "c1", name = "B", capacity = 30, studentCount = 20),
                    SectionDto("s1", classId = "c1", name = "A", capacity = 30, studentCount = 25),
                    SectionDto("sx", classId = "c1", name = "C", status = "ARCHIVED"),
                ),
            )
            else -> error("unexpected ${method.name}")
        }
    } as OrganisationApi

    private val repository = DefaultClassesOverviewRepository(api, ApiCaller(NetworkJson, dispatcher))

    @Test
    fun overview_maps_cards_in_level_order() = runTest(dispatcher) {
        overview = listOf(
            NetworkJson.decodeFromString(
                """{"id":"c9","name":"Class 9","levelOrder":12,"status":"ACTIVE","studentCount":58,"capacity":80,
                   "sections":[{"id":"b","name":"B","group":"Arts","studentCount":28,"capacity":40,"room":null,"classTeacher":null,"timetable":"DRAFT"},
                               {"id":"a","name":"A","group":"Science","studentCount":30,"capacity":40,"room":{"id":"r","name":"R-12"},
                                "classTeacher":{"id":"t","name":"Ms Sana"},"timetable":"PUBLISHED"}],
                   "subjects":[{"id":"e","name":"English","periodsPerWeek":6,"group":null}],
                   "issues":["NO_CLASS_TEACHER","SUBJECTS_WITHOUT_TEACHER","SOMETHING_NEW"],"unallocated":3}""",
            ),
            ClassOverviewDto(id = "pg", name = "Playgroup", levelOrder = 1),
        )
        val cards = (repository.overview("b1", "s1", null) as AppResult.Success).data

        assertEquals(listOf("Playgroup", "Class 9"), cards.map { it.name })
        val nine: ClassOverview = cards[1]
        assertEquals(listOf("A", "B"), nine.sections.map { it.name })
        assertEquals("Ms Sana", nine.sections[0].classTeacherName)
        assertEquals("R-12", nine.sections[0].roomName)
        assertEquals(TimetableState.DRAFT, nine.sections[1].timetable)
        assertEquals(listOf(ClassIssue.NO_CLASS_TEACHER, ClassIssue.SUBJECTS_WITHOUT_TEACHER), nine.issues)
        assertEquals(1, nine.subjectCount)
        assertEquals(listOf("classesOverview"), calls)
    }

    @Test
    fun older_server_without_overview_builds_cards_from_lists() = runTest(dispatcher) {
        overviewFailure = httpError(404, "NOT_FOUND")
        val cards = (repository.overview("b1", "s1", "se1") as AppResult.Success).data

        assertEquals(listOf("Class 1", "Class 2"), cards.map { it.name })
        assertEquals(listOf("A", "B"), cards[0].sections.map { it.name })
        assertEquals(45, cards[0].studentCount)
        assertEquals(60, cards[0].capacity)
        assertTrue(cards[0].issues.isEmpty())
        assertEquals(listOf(ClassIssue.NO_SECTIONS), cards[1].issues)
        assertEquals(7, cards[1].subjectCount)
        assertNull(cards[1].capacity)
    }

    @Test
    fun other_errors_are_returned_without_fallback() = runTest(dispatcher) {
        overviewFailure = httpError(500, "INTERNAL")
        val result = repository.overview("b1", "s1", null)
        assertTrue((result as AppResult.Failure).error is AppError.Server)
        assertEquals(listOf("classesOverview"), calls)
    }
}
