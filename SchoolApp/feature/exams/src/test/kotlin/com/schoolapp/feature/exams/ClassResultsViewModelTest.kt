package com.schoolapp.feature.exams

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.exams.Exam
import com.schoolapp.core.model.exams.ExamStatus
import com.schoolapp.core.model.exams.LoadedMarkSheet
import com.schoolapp.core.testing.FakeAuthRepository
import com.schoolapp.core.testing.MainDispatcherRule
import com.schoolapp.core.testing.TestSessions
import com.schoolapp.feature.exams.classresults.ClassResultsViewModel
import com.schoolapp.feature.exams.classresults.ResultSection
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

class ClassResultsViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val published = Exam("mid", "Mid-term", null, ExamStatus.PUBLISHED, "Term 1")
    private val computed = Exam("unit", "Unit test", null, ExamStatus.MARKS_CLOSED, null, computedAt = "2026-10-01T00:00:00Z")
    private val open = Exam("final", "Final", null, ExamStatus.MARKS_OPEN, "Term 2")
    private val base = sheet(rows = emptyList())

    private val repository = FakeExamsRepository(LoadedMarkSheet(base, null)).apply {
        examList = listOf(open, published, computed)
        sheetsByExam = mapOf(
            "mid" to listOf(
                base.copy(id = "m1", sectionId = "sec2", sectionName = "B"),
                base.copy(id = "m2", sectionId = "sec1", sectionName = "A"),
                base.copy(id = "m3", sectionId = "sec1", sectionName = "A", subjectName = "English"),
            ),
            "unit" to listOf(base.copy(id = "u1")),
        )
        resultsBySection = mapOf(
            "sec1" to listOf(result("s1", "mid", 82.5), result("s2", "mid", 61.0)),
            "sec2" to listOf(result("s3", "mid", 74.0)),
        )
    }

    private fun viewModel(vararg permissions: String) =
        ClassResultsViewModel(repository, FakeAuthRepository(TestSessions.session(RoleKey.TEACHER, *permissions)))

    @Test
    fun teacher_sees_approved_exams_and_first_section_results() = runTest {
        val state = viewModel("exams.view").uiState.value

        assertEquals(listOf("mid"), state.exams.map { it.id })
        assertEquals(listOf(ResultSection("sec1", "Class 5-A"), ResultSection("sec2", "Class 5-B")), state.sections)
        assertEquals("sec1", state.selectedSectionId)
        assertEquals(listOf("s1", "s2"), state.results.map { it.studentId })
        assertEquals(listOf("mid" to "sec1"), repository.resultCalls)
        assertFalse(state.notApproved)
        assertFalse(state.listLoading)
    }

    @Test
    fun approver_also_sees_computed_exams_with_not_approved_notice() = runTest {
        val vm = viewModel("exams.view", "exams.approve")
        assertEquals(listOf("mid", "unit"), vm.uiState.value.exams.map { it.id })

        vm.onExamSelected("unit")

        val state = vm.uiState.value
        assertTrue(state.notApproved)
        assertEquals("sec1", state.selectedSectionId)
        assertEquals("unit" to "sec1", repository.resultCalls.last())
    }

    @Test
    fun section_switch_loads_its_results_and_student_sheet_opens() = runTest {
        val vm = viewModel("exams.view")

        vm.onSectionSelected("sec2")
        assertEquals(listOf("s3"), vm.uiState.value.results.map { it.studentId })

        vm.onStudentClick("s3")
        assertEquals(74.0, vm.uiState.value.openResult?.percent)
        vm.onSheetDismiss()
        assertNull(vm.uiState.value.openResult)
    }

    @Test
    fun results_failure_is_shown_and_refresh_retries() = runTest {
        repository.resultsFailure = AppError.Network
        val vm = viewModel("exams.view")
        assertEquals(AppError.Network, vm.uiState.value.listError)

        repository.resultsFailure = null
        vm.refresh()

        assertNull(vm.uiState.value.listError)
        assertEquals(2, vm.uiState.value.results.size)
        assertFalse(vm.uiState.value.isRefreshing)
    }
}
