package com.schoolapp.feature.exams

import com.schoolapp.core.model.ChildSummary
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.exams.ChildResults
import com.schoolapp.core.model.exams.LoadedMarkSheet
import com.schoolapp.core.model.exams.ReportCard
import com.schoolapp.core.model.exams.ReportCardStatus
import com.schoolapp.core.model.exams.TrendPoint
import com.schoolapp.core.model.progress.ProgressCategory
import com.schoolapp.core.model.progress.ProgressNote
import com.schoolapp.core.testing.FakeAuthRepository
import com.schoolapp.core.testing.MainDispatcherRule
import com.schoolapp.core.testing.TestSessions
import com.schoolapp.feature.exams.components.formatMarks
import com.schoolapp.feature.exams.entry.MarkError
import com.schoolapp.feature.exams.entry.MarksValidation
import com.schoolapp.feature.exams.entry.ParsedMarks
import com.schoolapp.feature.exams.results.ParentResultsViewModel
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Rule
import org.junit.Test

class ParentResultsAndValidationTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val repository = FakeExamsRepository(LoadedMarkSheet(sheet(rows = emptyList()), null)).apply {
        childResults = mapOf(
            "c1" to ChildResults(listOf(result("c1", "mid", 82.5), result("c1", "unit", 70.0)), listOf(TrendPoint("unit", "Unit", 70.0), TrendPoint("mid", "Mid", 82.5))),
            "c2" to ChildResults(listOf(result("c2", "mid", 55.0)), listOf(TrendPoint("mid", "Mid", 55.0))),
        )
    }
    private val notes = FakeProgressRepository(
        mapOf("c2" to listOf(ProgressNote("n1", "c2", ProgressCategory.LEARNING, "Practise tables", true, null, "2026-10-01"))),
    )
    private val parent = FakeAuthRepository(
        TestSessions.session(RoleKey.PARENT, "exams.view").copy(
            children = listOf(ChildSummary("c1", "Ayesha Khan"), ChildSummary("c2", "Omar Khan")),
            activeChildId = "c1",
        ),
    )

    @Test
    fun results_follow_the_active_child() = runTest {
        val vm = ParentResultsViewModel(parent, repository, notes)
        assertEquals("c1", vm.uiState.value.childId)
        assertEquals(listOf("mid", "unit"), vm.uiState.value.results.map { it.examId })
        assertEquals(2, vm.uiState.value.trend.size)
        assertEquals(0, vm.uiState.value.notes.size)

        parent.selectChild("c2")

        val state = vm.uiState.value
        assertEquals("c2", state.childId)
        assertEquals("Omar Khan", state.childName)
        assertEquals(listOf(55.0), state.results.map { it.percent })
        assertEquals(listOf("n1"), state.notes.map { it.id })
    }

    @Test
    fun report_card_pending_shows_message_and_ready_opens_file() {
        val vm = ParentResultsViewModel(parent, repository, notes)
        vm.onReportCard("mid")
        assertEquals(ReportCardStatus.PENDING, vm.uiState.value.reportCards["mid"]?.status)
        assertNull(vm.uiState.value.openUrl)

        repository.reportCard = ReportCard(ReportCardStatus.READY, "https://files.school.pk/rc.pdf", "2026-10-01T10:00:00Z")
        vm.onReportCard("mid")
        assertEquals("https://files.school.pk/rc.pdf", vm.uiState.value.openUrl)
        vm.onUrlOpened()
        assertNull(vm.uiState.value.openUrl)
    }

    @Test
    fun no_child_linked_stops_loading() {
        val vm = ParentResultsViewModel(FakeAuthRepository(TestSessions.session(RoleKey.PARENT)), repository, notes)
        assertNull(vm.uiState.value.childId)
        assertEquals(false, vm.uiState.value.isLoading)
    }

    @Test
    fun validation_distinguishes_blank_zero_and_errors() {
        assertEquals(ParsedMarks.Blank, MarksValidation.parse("  ", 100.0))
        assertEquals(ParsedMarks.Value(0.0), MarksValidation.parse("0", 100.0))
        assertEquals(ParsedMarks.Value(45.25), MarksValidation.parse("45,25", 100.0))
        assertEquals(ParsedMarks.Value(100.0), MarksValidation.parse("100", 100.0))
        assertEquals(ParsedMarks.Invalid(MarkError.TOO_HIGH), MarksValidation.parse("100.5", 100.0))
        assertEquals(ParsedMarks.Invalid(MarkError.NEGATIVE), MarksValidation.parse("-3", 100.0))
        assertEquals(ParsedMarks.Invalid(MarkError.TOO_MANY_DECIMALS), MarksValidation.parse("12.345", 100.0))
        assertEquals(ParsedMarks.Invalid(MarkError.INVALID), MarksValidation.parse("1.2.3", 100.0))
        assertEquals("12.5", MarksValidation.sanitize("12.5 "))
    }

    @Test
    fun marks_are_formatted_without_trailing_zeros() {
        assertEquals("100", formatMarks(100.0))
        assertEquals("0", formatMarks(0.0))
        assertEquals("45.5", formatMarks(45.50))
        assertEquals("33.33", formatMarks(33.333))
    }
}
