package com.schoolapp.feature.activities

import androidx.lifecycle.SavedStateHandle
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.model.ChildSummary
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.activity.ActivityStatus
import com.schoolapp.core.model.activity.ConsentStatus
import com.schoolapp.core.testing.FakeAuthRepository
import com.schoolapp.core.testing.MainDispatcherRule
import com.schoolapp.core.testing.TestSessions
import com.schoolapp.feature.activities.detail.ActivityDetailViewModel
import com.schoolapp.feature.activities.detail.ActivityMessage
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import java.time.LocalDateTime

class ActivityDetailViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val repository = FakeActivitiesRepository()

    private fun parentAuth() = FakeAuthRepository(
        TestSessions.session(RoleKey.PARENT, "activities.view", branchId = null).copy(
            children = listOf(ChildSummary("c1", "Ali Khan")),
            activeChildId = "c1",
        ),
    )

    private fun viewModel(now: LocalDateTime, auth: FakeAuthRepository = parentAuth()) =
        ActivityDetailViewModel(SavedStateHandle(mapOf("activityId" to "a1")), repository, auth, AppClock { now })

    @Test
    fun parent_can_decline_then_grant_before_deadline() {
        val vm = viewModel(LocalDateTime.of(2026, 10, 9, 10, 0))
        var state = vm.uiState.value
        assertTrue(state.showGrant)
        assertTrue(state.showDecline)

        vm.decideConsent(ConsentStatus.DECLINED)
        state = vm.uiState.value
        assertEquals(ConsentStatus.DECLINED, state.myConsent)
        assertEquals(ActivityMessage.CONSENT_SAVED, state.message)
        assertTrue(state.showGrant)
        assertFalse(state.showDecline)

        vm.decideConsent(ConsentStatus.GRANTED)
        state = vm.uiState.value
        assertEquals(ConsentStatus.GRANTED, state.myConsent)
        assertFalse(state.showGrant)
        assertTrue(state.showDecline)
        assertEquals(
            listOf(ConsentStatus.DECLINED, ConsentStatus.GRANTED),
            repository.decisions.map { it.third },
        )
        assertEquals("c1", repository.decisions.first().second)
    }

    @Test
    fun buttons_hidden_after_deadline_and_decision_ignored() {
        val vm = viewModel(LocalDateTime.of(2026, 10, 11, 8, 0))
        val state = vm.uiState.value
        assertFalse(state.consentOpen)
        assertFalse(state.showGrant)
        assertFalse(state.showDecline)
        vm.decideConsent(ConsentStatus.GRANTED)
        assertTrue(repository.decisions.isEmpty())
    }

    @Test
    fun deadline_day_itself_is_still_open() {
        val vm = viewModel(LocalDateTime.of(2026, 10, 10, 22, 30))
        assertTrue(vm.uiState.value.showGrant)
    }

    @Test
    fun principal_can_approve_proposed_activity() {
        repository.items = listOf(activity(status = ActivityStatus.PROPOSED))
        val auth = FakeAuthRepository(TestSessions.session(RoleKey.PRINCIPAL, "activities.view", "activities.approve"))
        val vm = viewModel(LocalDateTime.of(2026, 10, 9, 10, 0), auth)
        assertTrue(vm.uiState.value.canApprove)
        vm.approve()
        val state = vm.uiState.value
        assertFalse(state.canApprove)
        assertEquals(ActivityStatus.ANNOUNCED, state.activity?.status)
        assertEquals(ActivityMessage.APPROVED, state.message)
        assertFalse(state.showGrant)
    }
}
