package com.schoolapp.feature.admin.roles.editor

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.navigation.toRoute
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.roles.RolesRepository
import com.schoolapp.core.model.roles.RoleInput
import com.schoolapp.feature.admin.R
import com.schoolapp.feature.admin.roles.MatrixAction
import com.schoolapp.feature.admin.roles.MatrixRow
import com.schoolapp.feature.admin.roles.RoleEditorDestination
import com.schoolapp.feature.admin.roles.RoleEvents
import com.schoolapp.feature.admin.roles.columnKeys
import com.schoolapp.feature.admin.roles.setKeys
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class RoleEditorViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val repository: RolesRepository,
    private val authRepository: AuthRepository,
    private val events: RoleEvents,
) : ViewModel() {

    private val roleId: String? = savedStateHandle.toRoute<RoleEditorDestination>().roleId
    private val loader = RoleEditorLoader(repository)

    private val _uiState = MutableStateFlow(RoleEditorUiState(isNew = roleId == null))
    val uiState: StateFlow<RoleEditorUiState> = _uiState.asStateFlow()

    init {
        load()
    }

    fun load() {
        _uiState.update { it.copy(isLoading = true, loadError = null) }
        viewModelScope.launch {
            val session = authRepository.session.first()
            _uiState.update { loader.load(roleId, session, it) }
        }
    }

    fun onNameChange(name: String) = edit { it.copy(name = name, nameError = null, nameServerError = null) }
    fun onSchoolChange(id: String) = edit { it.copy(schoolId = id) }
    fun onModuleQueryChange(query: String) = _uiState.update { it.copy(moduleQuery = query) }
    fun toggle(key: String, on: Boolean) = setPermissions(listOf(key), on)
    fun toggleRow(row: MatrixRow, on: Boolean) = setPermissions(row.keys, on)
    fun toggleColumn(action: MatrixAction, on: Boolean) = setPermissions(columnKeys(_uiState.value.visibleRows, action), on)

    private fun setPermissions(keys: List<String>, on: Boolean) {
        if (!_uiState.value.rights.permissions) return
        edit { it.copy(selected = setKeys(it.selected, keys, on), permissionsError = false) }
    }

    private fun edit(change: (RoleEditorUiState) -> RoleEditorUiState) =
        _uiState.update { change(it).copy(isDirty = true, saveError = null) }

    fun save() {
        val state = _uiState.value
        if (state.isSaving) return
        if (state.rights.readOnly) {
            _uiState.update { it.copy(done = true) }
            return
        }
        val nameError = if (state.rights.name) validateRoleName(state.name) else null
        val permissionsError = state.rights.permissions && state.selected.isEmpty()
        if (nameError != null || permissionsError) {
            _uiState.update { it.copy(nameError = nameError, permissionsError = permissionsError) }
            return
        }
        val input = if (state.role == null) {
            RoleInput(name = state.name, schoolId = state.schoolId.ifBlank { null }, permissions = state.selected)
        } else {
            RoleInput(
                name = state.name.takeIf { state.rights.name },
                permissions = state.selected.takeIf { state.rights.permissions },
            )
        }
        _uiState.update { it.copy(isSaving = true, saveError = null) }
        viewModelScope.launch {
            when (val result = repository.save(roleId, input)) {
                is AppResult.Success -> {
                    val session = authRepository.session.first()
                    // Changing the role the user is acting as must apply to their own menu straight away.
                    if (session != null && session.activeRole.key == result.data.key) authRepository.refreshSession()
                    events.post(if (roleId == null) R.string.roles_created else R.string.roles_updated)
                    _uiState.update { it.copy(isSaving = false, isDirty = false, done = true) }
                }
                is AppResult.Failure -> _uiState.update { it.withSaveError(result.error) }
            }
        }
    }

    private fun RoleEditorUiState.withSaveError(error: AppError): RoleEditorUiState {
        val nameMessage = when (error) {
            is AppError.Server -> error.message.takeIf { error.httpCode == HTTP_CONFLICT }
            is AppError.Validation -> error.fields["name"]
            else -> null
        }
        return if (nameMessage != null) {
            copy(isSaving = false, nameServerError = nameMessage)
        } else {
            copy(isSaving = false, saveError = error)
        }
    }

    private companion object {
        const val HTTP_CONFLICT = 409
    }
}
