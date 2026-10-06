package com.schoolapp.feature.organisation

import androidx.lifecycle.SavedStateHandle
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.organisation.Subject
import com.schoolapp.core.testing.FakeAuthRepository
import com.schoolapp.core.testing.MainDispatcherRule
import com.schoolapp.core.testing.TestSessions
import com.schoolapp.feature.organisation.FakeOrganisationRepository.Companion.branch
import com.schoolapp.feature.organisation.classes.ClassesViewModel
import com.schoolapp.feature.organisation.scope.BranchOptionsLoader
import com.schoolapp.feature.organisation.sessions.SessionsCalendarViewModel
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

class ScopedRefreshTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val repository = FakeOrganisationRepository()
    private val loader = BranchOptionsLoader(
        FakeAuthRepository(TestSessions.session(RoleKey.PRINCIPAL, "branches.view")),
        repository,
    )

    @Test
    fun classes_refresh_reloads_selected_branch() {
        val vm = ClassesViewModel(loader, repository, SavedStateHandle())
        repository.subjects = listOf(Subject("m", "MTH", "Maths"), Subject("e", "ENG", "English"))
        vm.refresh()
        val state = vm.uiState.value
        assertEquals("b1", state.selectedBranchId)
        assertEquals(2, state.subjects.size)
        assertFalse(state.isRefreshing)
        assertFalse(state.isLoading)
    }

    @Test
    fun classes_failed_refresh_keeps_lists() {
        val vm = ClassesViewModel(loader, repository, SavedStateHandle())
        repository.failure = AppError.Network
        vm.refresh()
        val state = vm.uiState.value
        assertEquals(listOf("s1"), state.sections.map { it.id })
        assertEquals(listOf("c5"), state.classes.map { it.id })
        assertEquals(AppError.Network, state.error)
        assertFalse(state.isRefreshing)
        assertFalse(state.isLoading)
    }

    @Test
    fun classes_branch_switch_failure_does_not_show_previous_branch() {
        repository.branches = listOf(branch("b1"), branch("b2"))
        val vm = ClassesViewModel(loader, repository, SavedStateHandle())
        repository.failure = AppError.Network
        vm.onBranchSelected("b2")
        val state = vm.uiState.value
        assertEquals("b2", state.selectedBranchId)
        assertTrue(state.sections.isEmpty())
        assertFalse(state.hasContent)
        assertEquals(AppError.Network, state.error)
    }

    @Test
    fun sessions_refresh_keeps_data_on_failure_then_recovers() {
        val vm = SessionsCalendarViewModel(loader, repository, SavedStateHandle())
        repository.failure = AppError.Network
        vm.refresh()
        assertEquals(listOf("se1"), vm.uiState.value.sessions.map { it.id })
        assertEquals(listOf("e1"), vm.uiState.value.events.map { it.id })
        assertEquals(AppError.Network, vm.uiState.value.error)
        assertFalse(vm.uiState.value.isRefreshing)

        repository.failure = null
        repository.events = emptyList()
        vm.refresh()
        assertNull(vm.uiState.value.error)
        assertTrue(vm.uiState.value.events.isEmpty())
        assertFalse(vm.uiState.value.isLoading)
    }

    @Test
    fun sessions_refresh_after_failed_first_load_fetches_options_again() {
        repository.failure = AppError.Network
        val vm = SessionsCalendarViewModel(loader, repository, SavedStateHandle())
        assertEquals(AppError.Network, vm.uiState.value.error)
        repository.failure = null
        vm.refresh()
        assertEquals("b1", vm.uiState.value.selectedBranchId)
        assertEquals(listOf("se1"), vm.uiState.value.sessions.map { it.id })
        assertNull(vm.uiState.value.error)
    }
}
