package com.schoolapp.feature.exams

import androidx.lifecycle.SavedStateHandle
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.exams.LoadedMarkSheet
import com.schoolapp.core.model.exams.MarkEntry
import com.schoolapp.core.model.exams.MarkSheetOutcome
import com.schoolapp.core.model.exams.MarkSheetStatus
import com.schoolapp.core.testing.FakeAuthRepository
import com.schoolapp.core.testing.MainDispatcherRule
import com.schoolapp.core.testing.TestSessions
import com.schoolapp.feature.exams.entry.MarkError
import com.schoolapp.feature.exams.entry.MarksEntryViewModel
import com.schoolapp.feature.exams.entry.MarksMessage
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

class MarksEntryViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val rows = listOf(row("s1", 1, marks = 0.0), row("s2", 2), row("s3", 3, absent = true))
    private val repository = FakeExamsRepository(LoadedMarkSheet(sheet(rows = rows), localEntries = null))
    private val teacher = FakeAuthRepository(TestSessions.session(RoleKey.TEACHER, "exams.view", "exams.edit", "exams.submit"))

    private fun viewModel(auth: FakeAuthRepository = teacher) =
        MarksEntryViewModel(SavedStateHandle(mapOf("sheetId" to "ms1", "title" to "Class 5-A · Mathematics")), repository, auth)

    @Test
    fun zero_is_entered_and_blank_is_pending() {
        val vm = viewModel()
        val state = vm.uiState.value
        val byId = state.rows.associateBy { it.studentId }
        assertEquals("0", byId.getValue("s1").text)
        assertFalse(byId.getValue("s1").isPending)
        assertTrue(byId.getValue("s2").isPending)
        assertEquals(1, state.counts.entered)
        assertEquals(1, state.counts.pending)
        assertEquals(1, state.counts.absent)

        vm.onMarksChange("s2", "0")
        assertEquals(0, vm.uiState.value.counts.pending)
        assertEquals(listOf(0.0, 0.0, null), vm.uiState.value.entries().map { it.marks })
    }

    @Test
    fun blank_marks_are_sent_as_null_never_zero() {
        val vm = viewModel()
        vm.saveDraft()
        val sent = repository.saveCalls.single().first
        assertEquals(MarkEntry("s1", 0.0, false), sent[0])
        assertEquals(MarkEntry("s2", null, false), sent[1])
        assertEquals(MarkEntry("s3", null, true), sent[2])
    }

    @Test
    fun absent_clears_marks_and_is_not_pending() {
        val vm = viewModel()
        vm.onMarksChange("s2", "45")
        vm.onAbsentChange("s2", true)
        val row = vm.uiState.value.rows.first { it.studentId == "s2" }
        assertTrue(row.absent)
        assertEquals("", row.text)
        assertFalse(row.isPending)
        assertEquals(MarkEntry("s2", null, true), vm.uiState.value.entries()[1])

        vm.onAbsentChange("s2", false)
        assertTrue(vm.uiState.value.rows.first { it.studentId == "s2" }.isPending)
    }

    @Test
    fun marks_above_max_block_save() {
        val vm = viewModel()
        vm.onMarksChange("s2", "101")
        assertEquals(MarkError.TOO_HIGH, vm.uiState.value.rows.first { it.studentId == "s2" }.error)
        vm.saveDraft()
        assertTrue(repository.saveCalls.isEmpty())
        assertTrue(vm.uiState.value.invalidBlocking)
        assertEquals("s2", vm.uiState.value.scrollToStudentId)
    }

    @Test
    fun offline_queued_outcome_keeps_unsent_changes() {
        repository.outcomes += AppResult.Success(MarkSheetOutcome.Queued)
        val vm = viewModel()
        vm.onMarksChange("s2", "67.5")
        vm.saveDraft()
        val state = vm.uiState.value
        assertEquals(MarksMessage.QUEUED, state.message)
        assertTrue(state.hasUnsentChanges)
        assertNull(state.busyAction)
        assertEquals("67.5", state.rows.first { it.studentId == "s2" }.text)
    }

    @Test
    fun submit_with_pending_rows_is_blocked() {
        val vm = viewModel()
        vm.onSubmitClick()
        val state = vm.uiState.value
        assertEquals(1, state.pendingBlocking)
        assertFalse(state.confirmSubmit)
        assertEquals("s2", state.scrollToStudentId)
        assertTrue(repository.submitCalls.isEmpty())
    }

    @Test
    fun complete_sheet_submits_after_confirm() {
        val vm = viewModel()
        vm.onMarksChange("s2", "50")
        vm.onSubmitClick()
        assertTrue(vm.uiState.value.confirmSubmit)
        vm.onConfirmSubmit()
        assertEquals(1, repository.submitCalls.size)
        assertEquals(MarkSheetStatus.SUBMITTED, vm.uiState.value.status)
        assertTrue(vm.uiState.value.isReadOnly)
        assertEquals(MarksMessage.SUBMITTED, vm.uiState.value.message)
    }

    @Test
    fun retry_after_failure_reuses_client_request_id_until_marks_change() {
        repository.outcomes += AppResult.Failure(AppError.Server(500, null, null))
        repository.outcomes += AppResult.Failure(AppError.Server(500, null, null))
        val vm = viewModel()
        vm.onMarksChange("s2", "40")
        vm.saveDraft()
        assertEquals(AppError.Server(500, null, null), vm.uiState.value.actionError)
        vm.saveDraft()
        assertEquals(repository.saveCalls[0].second, repository.saveCalls[1].second)

        vm.onMarksChange("s2", "41")
        vm.saveDraft()
        assertNotEquals(repository.saveCalls[1].second, repository.saveCalls[2].second)
    }

    @Test
    fun submitted_sheet_is_read_only() {
        repository.loaded = LoadedMarkSheet(sheet(MarkSheetStatus.SUBMITTED, rows), null)
        val vm = viewModel()
        vm.onMarksChange("s2", "10")
        assertTrue(vm.uiState.value.isReadOnly)
        assertTrue(vm.uiState.value.rows.first { it.studentId == "s2" }.isPending)
    }

    @Test
    fun returned_sheet_is_editable_and_queued_marks_flag_unsent_changes() {
        repository.loaded = LoadedMarkSheet(sheet(MarkSheetStatus.RETURNED, rows, comment = "Check s2"), listOf(MarkEntry("s2", 12.0, false)))
        val vm = viewModel()
        assertFalse(vm.uiState.value.isReadOnly)
        assertTrue(vm.uiState.value.hasUnsentChanges)
    }

    @Test
    fun without_submit_permission_submit_is_not_offered() {
        val vm = viewModel(FakeAuthRepository(TestSessions.session(RoleKey.PRINCIPAL, "exams.edit")))
        vm.onMarksChange("s2", "50")
        vm.onSubmitClick()
        assertFalse(vm.uiState.value.confirmSubmit)
        assertTrue(repository.submitCalls.isEmpty())
    }
}
