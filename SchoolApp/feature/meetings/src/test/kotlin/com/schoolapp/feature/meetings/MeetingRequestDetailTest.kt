package com.schoolapp.feature.meetings

import androidx.lifecycle.SavedStateHandle
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.meeting.MeetingStatus
import com.schoolapp.core.testing.FakeAuthRepository
import com.schoolapp.core.testing.MainDispatcherRule
import com.schoolapp.core.testing.TestSessions
import com.schoolapp.feature.meetings.detail.MeetingAction
import com.schoolapp.feature.meetings.detail.MeetingDetailViewModel
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import java.time.LocalDateTime

class MeetingRequestDetailTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val repository = FakeMeetingsRepository().apply { upcoming = listOf(meeting(status = MeetingStatus.REQUESTED)) }

    private fun viewModel(role: RoleKey = RoleKey.TEACHER) = MeetingDetailViewModel(
        SavedStateHandle(mapOf("meetingId" to "m1", "box" to "UPCOMING")),
        repository,
        FakeAuthRepository(TestSessions.session(role, "meetings.view")),
        AppClock { LocalDateTime.of(2026, 10, 8, 10, 0) },
    )

    @Test
    fun staff_can_answer_a_request_but_not_complete_it() {
        val state = viewModel().uiState.value
        assertTrue(state.canAnswer)
        assertFalse(state.canAct)
    }

    @Test
    fun accept_confirms_the_suggested_time() {
        val vm = viewModel()
        vm.accept()
        assertEquals(listOf("m1"), repository.accepted)
        assertEquals(MeetingAction.ACCEPT, vm.uiState.value.done)
        assertEquals(MeetingStatus.SCHEDULED, vm.uiState.value.meeting?.status)
        assertTrue(vm.uiState.value.canAct)
    }

    @Test
    fun decline_sends_the_reason() {
        val vm = viewModel()
        vm.openDecline()
        assertTrue(vm.uiState.value.declining)
        vm.onCancelReasonChange(" Away that week ")
        vm.submitCancel()
        assertEquals(listOf("m1" to "Away that week"), repository.declined)
        assertEquals(MeetingAction.DECLINE, vm.uiState.value.done)
    }

    @Test
    fun parents_cannot_answer() {
        val vm = viewModel(RoleKey.PARENT)
        assertFalse(vm.uiState.value.canAnswer)
        vm.accept()
        assertTrue(repository.accepted.isEmpty())
    }
}
