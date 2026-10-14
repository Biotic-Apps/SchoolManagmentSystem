package com.schoolapp.feature.settings.shell

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.settings.SettingsRepository
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.SessionContext
import com.schoolapp.core.model.settings.NamedOption
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Settings are per school: a super admin picks one, everyone else uses their own school. */
@HiltViewModel
internal class SettingsShellViewModel @Inject constructor(
    private val authRepository: AuthRepository,
    private val repository: SettingsRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(SettingsShellUiState())
    val uiState: StateFlow<SettingsShellUiState> = _uiState.asStateFlow()

    private var loadJob: Job? = null

    init {
        load()
    }

    fun retry() = load()

    fun selectSchool(id: String) = _uiState.update { it.copy(schoolId = id) }

    fun selectTab(index: Int) = _uiState.update { state -> state.tabs.getOrNull(index)?.let { state.copy(tab = it) } ?: state }

    private fun load() {
        loadJob?.cancel()
        loadJob = viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            val session = authRepository.session.first()
            val isSuperAdmin = session?.activeRole == RoleKey.SUPER_ADMIN
            val isPrincipal = session?.activeRole == RoleKey.PRINCIPAL
            val canEdit = session?.has(EDIT) == true
            val tabs = visibleTabs(isSuperAdmin, isPrincipal, canEdit)
            val schools = if (isSuperAdmin) {
                when (val result = repository.schools()) {
                    is AppResult.Success -> result.data
                    is AppResult.Failure -> {
                        _uiState.update { it.copy(isLoading = false, error = result.error) }
                        return@launch
                    }
                }
            } else {
                session.ownSchools()
            }
            _uiState.update { state ->
                state.copy(
                    isLoading = false,
                    schools = schools,
                    schoolId = schools.firstOrNull { it.id == state.schoolId }?.id ?: schools.firstOrNull()?.id,
                    tabs = tabs,
                    tab = state.tab.takeIf { it in tabs } ?: SettingsTab.SCHOOL,
                    canEdit = canEdit,
                    isSuperAdmin = isSuperAdmin,
                )
            }
        }
    }

    private fun SessionContext?.ownSchools(): List<NamedOption> =
        this?.activeAssignments.orEmpty()
            .mapNotNull { assignment -> assignment.schoolId?.let { NamedOption(it, assignment.schoolName ?: it) } }
            .distinctBy { it.id }

    private companion object {
        const val EDIT = "settings.edit"
    }
}
