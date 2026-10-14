package com.schoolapp.feature.inventory.shell

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.inventory.InventoryRepository
import com.schoolapp.core.data.organisation.OrganisationRepository
import com.schoolapp.core.model.SessionContext
import com.schoolapp.core.model.organisation.BranchOption
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Branch scope, rights and the item catalogue for the Inventory & Purchasing menu. */
@HiltViewModel
class InventoryShellViewModel @Inject constructor(
    private val authRepository: AuthRepository,
    private val organisationRepository: OrganisationRepository,
    private val inventoryRepository: InventoryRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(InventoryShellState())
    val uiState: StateFlow<InventoryShellState> = _uiState.asStateFlow()

    private var catalogJob: Job? = null

    init {
        start()
    }

    fun retry() {
        _uiState.update { it.copy(isLoading = true, error = null) }
        start()
    }

    fun onBranchSelected(branchId: String) {
        if (branchId == _uiState.value.branchId) return
        _uiState.update { it.copy(branchId = branchId, catalog = emptyList()) }
        loadCatalog()
    }

    /** After any save: every tab reloads and the catalogue is fetched again (new items, prices). */
    fun onChanged() {
        _uiState.update { it.copy(version = it.version + 1) }
        loadCatalog()
    }

    private fun start() {
        viewModelScope.launch {
            val session = authRepository.session.filterNotNull().first()
            val rights = session.rights()
            val own = session.activeBranchId
            val branches = when (val result = organisationRepository.branches()) {
                is AppResult.Success -> result.data.map { BranchOption(it.id, it.name, it.schoolId) }
                is AppResult.Failure -> {
                    if (own == null) {
                        _uiState.update { it.copy(isLoading = false, error = result.error, rights = rights) }
                        return@launch
                    }
                    emptyList()
                }
            }
            val scoped = when {
                own == null -> branches
                branches.any { it.id == own } -> branches
                else -> listOf(BranchOption(own, "", null)) + branches
            }
            val selected = own ?: _uiState.value.branchId?.takeIf { id -> scoped.any { it.id == id } } ?: scoped.firstOrNull()?.id
            _uiState.update {
                it.copy(isLoading = false, error = null, branches = scoped, branchId = selected, rights = rights, canPickBranch = own == null)
            }
            loadCatalog()
        }
    }

    private fun loadCatalog() {
        val branchId = _uiState.value.branchId ?: return
        catalogJob?.cancel()
        catalogJob = viewModelScope.launch {
            val result = inventoryRepository.catalog(branchId)
            if (result is AppResult.Success && _uiState.value.branchId == branchId) {
                _uiState.update { it.copy(catalog = result.data) }
            }
        }
    }

    private fun SessionContext.rights() = InventoryRights(
        canAdd = has("inventory.add"),
        canEdit = has("inventory.edit"),
        canBill = has("expenses.add"),
        canSell = has("fees.add"),
    )
}
