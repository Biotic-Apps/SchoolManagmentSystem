package com.schoolapp.feature.admin.roles.list

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.roles.RolesRepository
import com.schoolapp.core.model.SessionContext
import com.schoolapp.core.model.roles.Role
import com.schoolapp.feature.admin.R
import com.schoolapp.feature.admin.roles.RoleEvents
import com.schoolapp.feature.admin.roles.RolePermissions
import com.schoolapp.feature.admin.roles.roleEditRights
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.drop
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class RolesListViewModel @Inject constructor(
    private val repository: RolesRepository,
    authRepository: AuthRepository,
    events: RoleEvents,
) : ViewModel() {

    private val _uiState = MutableStateFlow(RolesListUiState())
    val uiState: StateFlow<RolesListUiState> = _uiState.asStateFlow()
    private var session: SessionContext? = null

    init {
        viewModelScope.launch {
            authRepository.session.collect { current ->
                session = current
                _uiState.update { it.withRights(current) }
            }
        }
        viewModelScope.launch { repository.changes.drop(1).collect { load(quiet = true) } }
        viewModelScope.launch { events.messages.collect { msg -> _uiState.update { it.copy(message = msg) } } }
        viewModelScope.launch { load() }
    }

    fun onQueryChange(query: String) = _uiState.update { it.copy(query = query) }

    fun retry() {
        viewModelScope.launch { load() }
    }

    fun refresh() {
        _uiState.update { it.copy(isRefreshing = true) }
        viewModelScope.launch { load(quiet = true) }
    }

    fun askDelete(role: Role) = _uiState.update { it.copy(deleteTarget = role, actionError = null) }

    fun dismissDelete() = _uiState.update { it.copy(deleteTarget = null) }

    fun confirmDelete() {
        val target = _uiState.value.deleteTarget ?: return
        _uiState.update { it.copy(isDeleting = true) }
        viewModelScope.launch {
            when (val result = repository.delete(target.id)) {
                is AppResult.Success -> _uiState.update {
                    it.copy(isDeleting = false, deleteTarget = null, message = R.string.roles_deleted)
                }
                is AppResult.Failure -> _uiState.update {
                    it.copy(isDeleting = false, deleteTarget = null, actionError = result.error)
                }
            }
        }
    }

    fun messageShown() = _uiState.update { it.copy(message = null, actionError = null) }

    private suspend fun load(quiet: Boolean = false) {
        if (!quiet) _uiState.update { it.copy(isLoading = true, error = null) }
        when (val result = repository.roles()) {
            is AppResult.Success -> _uiState.update {
                it.copy(isLoading = false, isRefreshing = false, error = null, roles = result.data).withRights(session)
            }
            is AppResult.Failure -> _uiState.update {
                if (quiet && it.roles.isNotEmpty()) {
                    it.copy(isRefreshing = false, actionError = result.error)
                } else {
                    it.copy(isLoading = false, isRefreshing = false, error = result.error)
                }
            }
        }
    }

    private fun RolesListUiState.withRights(current: SessionContext?) = copy(
        canAdd = current?.has(RolePermissions.ADD) == true,
        canDelete = current?.has(RolePermissions.DELETE) == true,
        editableIds = roles.filter { roleEditRights(it, current).permissions }.map { it.id }.toSet(),
    )
}
