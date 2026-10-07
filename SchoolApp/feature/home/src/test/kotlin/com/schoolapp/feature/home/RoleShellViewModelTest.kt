package com.schoolapp.feature.home

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.branding.BrandingRepository
import com.schoolapp.core.data.notifications.NotificationsRepository
import com.schoolapp.core.model.RoleAssignment
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.ScopeType
import com.schoolapp.core.model.branding.Branding
import com.schoolapp.core.model.notification.AppNotification
import com.schoolapp.core.testing.FakeAuthRepository
import com.schoolapp.core.testing.MainDispatcherRule
import com.schoolapp.core.testing.TestSessions
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.launch
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Rule
import org.junit.Test

class RoleShellViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val session = TestSessions.session(RoleKey.PRINCIPAL).let {
        it.copy(assignments = it.assignments + RoleAssignment("a2", RoleKey.TEACHER, ScopeType.BRANCH, schoolId = "s2"))
    }
    private val auth = FakeAuthRepository(session)
    private val branding = FakeBrandingRepository()

    private fun viewModel() = RoleShellViewModel(auth, FakeNotificationsRepository(), branding, mainDispatcherRule.dispatcher)

    @Test
    fun refreshes_branding_for_active_school_and_on_role_change() {
        viewModel()
        assertEquals(listOf<String?>("s1"), branding.refreshCalls)
        auth.sessionState.value = session.copy(activeRole = RoleKey.TEACHER)
        assertEquals(listOf<String?>("s1", "s2"), branding.refreshCalls)
    }

    @Test
    fun child_switch_does_not_refetch_branding() {
        viewModel()
        auth.sessionState.value = session.copy(activeChildId = "c9")
        assertEquals(listOf<String?>("s1"), branding.refreshCalls)
    }

    @Test
    fun branding_reaches_ready_state_and_refresh_failure_is_ignored() = runTest {
        branding.next = AppResult.Failure(AppError.Network)
        val vm = viewModel()
        backgroundScope.launch(mainDispatcherRule.dispatcher) { vm.uiState.collect {} }
        assertEquals(null, (vm.uiState.value as RoleShellUiState.Ready).brand.name)
        branding.state.value = Branding("City School", null, null, "#0B7F74", null)
        assertEquals("City School", (vm.uiState.value as RoleShellUiState.Ready).brand.name)
    }

    private class FakeBrandingRepository : BrandingRepository {
        val state = MutableStateFlow<Branding?>(null)
        val refreshCalls = mutableListOf<String?>()
        var next: AppResult<Unit> = AppResult.Success(Unit)
        override val branding: Flow<Branding?> = state
        override suspend fun refresh(schoolId: String?): AppResult<Unit> {
            refreshCalls += schoolId
            return next
        }
    }

    private class FakeNotificationsRepository : NotificationsRepository {
        override val unreadCount: Flow<Int> = flowOf(0)
        override suspend fun notifications(unreadOnly: Boolean): AppResult<List<AppNotification>> = AppResult.Success(emptyList())
        override suspend fun markRead(id: String): AppResult<Unit> = AppResult.Success(Unit)
        override suspend fun markAllRead(): AppResult<Unit> = AppResult.Success(Unit)
    }
}
