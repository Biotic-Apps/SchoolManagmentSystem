package com.schoolapp.feature.meetings

import androidx.lifecycle.SavedStateHandle
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.meeting.FollowUpInput
import com.schoolapp.core.model.meeting.MeetingStatus
import com.schoolapp.core.testing.FakeAuthRepository
import com.schoolapp.core.testing.MainDispatcherRule
import com.schoolapp.core.testing.TestSessions
import com.schoolapp.feature.meetings.detail.MeetingAction
import com.schoolapp.feature.meetings.detail.MeetingDetailViewModel
import com.schoolapp.feature.meetings.domain.CompleteMeetingForm
import com.schoolapp.feature.meetings.domain.CompleteValidation
import com.schoolapp.feature.meetings.domain.FollowUpDraft
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import java.time.LocalDateTime

class CompleteMeetingTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val repository = FakeMeetingsRepository()
    private val auth = FakeAuthRepository(TestSessions.session(RoleKey.TEACHER, "meetings.view"))

    private fun viewModel() = MeetingDetailViewModel(
        SavedStateHandle(mapOf("meetingId" to "m1", "box" to "UPCOMING")), repository, auth, AppClock { LocalDateTime.of(2026, 10, 8, 10, 0) },
    )

    @Test
    fun validation_requires_notes_summary_when_shared_and_complete_follow_ups() {
        val empty = CompleteValidation.validate(CompleteMeetingForm())
        assertTrue(empty.notes)
        assertFalse(empty.summary)

        val form = CompleteMeetingForm(
            notes = "Discussed reading",
            shareSummary = true,
            followUps = listOf(FollowUpDraft(0, title = "Send reading list"), FollowUpDraft(1, dueDate = "2026-10-15"), FollowUpDraft(2, "Call", "2026-10-12")),
        )
        val errors = CompleteValidation.validate(form)
        assertFalse(errors.notes)
        assertTrue(errors.summary)
        assertEquals(setOf(1), errors.followUpTitles)
        assertEquals(setOf(0), errors.followUpDates)
        assertFalse(errors.isEmpty)
    }

    @Test
    fun complete_blocks_until_valid_then_sends_follow_ups_owned_by_caller() {
        val vm = viewModel()
        assertTrue(vm.uiState.value.canAct)
        vm.openComplete()
        vm.addFollowUp()
        vm.submitComplete()
        var state = vm.uiState.value
        assertTrue(state.completeErrors.notes)
        assertEquals(setOf(0), state.completeErrors.followUpTitles)
        assertEquals(setOf(0), state.completeErrors.followUpDates)
        assertTrue(repository.completions.isEmpty())

        vm.onNotesChange("Discussed reading")
        vm.onFollowUpTitleChange(0, "Send reading list")
        vm.onFollowUpDateChange(0, "2026-10-15")
        assertTrue(vm.uiState.value.completeErrors.isEmpty)
        vm.submitComplete()

        state = vm.uiState.value
        assertNull(state.completeForm)
        assertEquals(MeetingAction.COMPLETE, state.done)
        assertEquals(MeetingStatus.COMPLETED, state.meeting?.status)
        assertFalse(state.canAct)
        val input = repository.completions.single()
        assertEquals("Discussed reading", input.notes)
        assertFalse(input.shareSummaryWithParent)
        assertNull(input.summary)
        assertEquals(listOf(FollowUpInput("Send reading list", null, "2026-10-15")), input.followUps)
    }

    @Test
    fun no_show_and_cancel_only_for_scheduled() {
        repository.upcoming = listOf(meeting(status = MeetingStatus.COMPLETED))
        val vm = viewModel()
        assertFalse(vm.uiState.value.canAct)
        vm.askNoShow()
        assertFalse(vm.uiState.value.confirmNoShow)
    }
}
