package com.schoolapp.feature.organisation

import androidx.lifecycle.SavedStateHandle
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.testing.MainDispatcherRule
import com.schoolapp.feature.organisation.FakeOrganisationRepository.Companion.branch
import com.schoolapp.feature.organisation.branches.BranchDetailViewModel
import com.schoolapp.feature.organisation.branches.BranchesViewModel
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Rule
import org.junit.Test

class BranchesRefreshTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val repository = FakeOrganisationRepository()

    @Test
    fun refresh_updates_branch_list() {
        repository.branches = listOf(branch("b1"), branch("b2"))
        val vm = BranchesViewModel(repository)
        repository.branches = listOf(branch("b1"), branch("b2"), branch("b3"))
        vm.refresh()
        val state = vm.uiState.value
        assertEquals(listOf("b1", "b2", "b3"), state.branches.map { it.id })
        assertFalse(state.isRefreshing)
        assertFalse(state.isLoading)
        assertNull(state.error)
    }

    @Test
    fun failed_refresh_keeps_single_branch_overview() {
        val vm = BranchesViewModel(repository)
        repository.failure = AppError.Network
        vm.refresh()
        val state = vm.uiState.value
        assertEquals("b1", state.overview?.branch?.id)
        assertEquals(AppError.Network, state.error)
        assertFalse(state.isRefreshing)
        assertFalse(state.isLoading)
    }

    @Test
    fun refresh_after_error_recovers() {
        repository.failure = AppError.Network
        val vm = BranchesViewModel(repository)
        assertEquals(AppError.Network, vm.uiState.value.error)
        repository.failure = null
        vm.refresh()
        assertNull(vm.uiState.value.error)
        assertEquals("b1", vm.uiState.value.overview?.branch?.id)
    }

    @Test
    fun branch_detail_refresh_keeps_overview_on_failure_and_updates_on_success() {
        val vm = BranchDetailViewModel(SavedStateHandle(mapOf("id" to "b1")), repository)
        repository.failure = AppError.Network
        vm.refresh()
        assertEquals("Branch b1", vm.uiState.value.overview?.branch?.name)
        assertEquals(AppError.Network, vm.uiState.value.error)
        assertFalse(vm.uiState.value.isRefreshing)

        repository.failure = null
        repository.branches = listOf(branch("b1", name = "Renamed"))
        vm.refresh()
        assertEquals("Renamed", vm.uiState.value.overview?.branch?.name)
        assertNull(vm.uiState.value.error)
    }
}
