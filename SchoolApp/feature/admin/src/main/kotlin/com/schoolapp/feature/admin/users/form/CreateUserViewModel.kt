package com.schoolapp.feature.admin.users.form

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.users.UsersRepository
import com.schoolapp.core.model.users.NewUser
import com.schoolapp.feature.admin.common.AdminNotice
import com.schoolapp.feature.admin.common.AdminNotices
import com.schoolapp.feature.admin.users.UserPermissions
import com.schoolapp.feature.admin.users.assignments.AssignmentDraft
import com.schoolapp.feature.admin.users.assignments.AssignmentOptionsLoader
import com.schoolapp.feature.admin.users.assignments.today
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Add user: contact, optional initial password and 1–10 role assignments. */
@HiltViewModel
class CreateUserViewModel @Inject constructor(
    private val repository: UsersRepository,
    private val authRepository: AuthRepository,
    private val loader: AssignmentOptionsLoader,
    private val notices: AdminNotices,
) : ViewModel() {

    private val _uiState = MutableStateFlow(CreateUserUiState())
    val uiState: StateFlow<CreateUserUiState> = _uiState.asStateFlow()

    init {
        load()
    }

    fun load() {
        _uiState.update { it.copy(isLoading = true, loadError = null) }
        viewModelScope.launch {
            val permissions = UserPermissions.of(authRepository.session.first())
            when (val result = loader.load(permissions)) {
                is AppResult.Success -> _uiState.update { it.copy(isLoading = false, canAdd = permissions.canAdd, options = result.data) }
                is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, canAdd = permissions.canAdd, loadError = result.error) }
            }
        }
    }

    fun onContactChange(contact: UserContact) = edit { it.copy(contact = contact, serverErrors = emptyMap()) }

    fun onPasswordChange(password: String) = edit { it.copy(password = password) }

    fun onAssignmentChange(draft: AssignmentDraft) =
        edit { state -> state.copy(assignments = state.assignments.map { if (it.key == draft.key) draft else it }) }

    fun addAssignment() = edit { if (it.canAddAssignment) it.copy(assignments = it.assignments + AssignmentDraft()) else it }

    fun removeAssignment(key: Long) = edit { state ->
        if (state.assignments.size <= 1) state else state.copy(assignments = state.assignments.filterNot { it.key == key })
    }

    fun submit() {
        val state = validated(_uiState.value.copy(showErrors = true))
        _uiState.value = state
        if (state.isSaving || state.errors.isNotEmpty() || state.assignmentProblems.values.any { it.isNotEmpty() }) return
        _uiState.update { it.copy(isSaving = true, saveError = null) }
        viewModelScope.launch {
            val user = NewUser(
                name = state.contact.name,
                email = state.contact.email,
                phone = state.contact.phone,
                password = state.password.ifEmpty { null },
                assignments = state.assignments.map(AssignmentDraft::toRequest),
            )
            when (val result = repository.create(user)) {
                is AppResult.Success -> {
                    if (result.data.temporaryPassword == null) notices.post(AdminNotice(AdminNotice.Kind.USER_CREATED, user.name))
                    _uiState.update { it.copy(isSaving = false, created = result.data) }
                }
                is AppResult.Failure -> _uiState.update {
                    val fields = UserFormValidation.serverFields(result.error)
                    it.copy(isSaving = false, serverErrors = fields, saveError = result.error.takeIf { fields.isEmpty() })
                }
            }
        }
    }

    private fun edit(change: (CreateUserUiState) -> CreateUserUiState) = _uiState.update { state ->
        val next = change(state).copy(isDirty = true, saveError = null)
        if (next.showErrors) validated(next) else next
    }

    private fun validated(state: CreateUserUiState): CreateUserUiState {
        val today = today()
        return state.copy(
            errors = UserFormValidation.contact(state.contact) + UserFormValidation.password(state.password),
            assignmentProblems = state.assignments.associate { it.key to it.problems(today) },
        )
    }
}
